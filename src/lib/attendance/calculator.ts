// /lib/attendance/calculator.ts

export interface SubjectAttendanceStats {
  subjectId: string
  subjectName: string
  totalClasses: number          // held so far (present + absent, excl. cancelled)
  attended: number              // marked present
  absent: number                // unexcused + medical + excused
  medicalAbsences: number
  currentPercentage: number     // attended / totalClasses * 100
  requiredThreshold: number
  personalTarget: number | null

  // Forecasting (requires totalClassesPlanned)
  remainingClasses: number | null
  safeSkipsLeft: number | null         // can still miss while staying >= threshold
  classesNeededToRecover: number | null // attend this many consecutively to reach threshold
  projectedFinalPercentage: number | null

  // Health status
  healthStatus: 'safe' | 'caution' | 'danger' | 'unreachable'
  isGoalUnreachable: boolean
  isLastSafeAbsence: boolean    // safeSkipsLeft === 1
  isInDangerZone: boolean       // within 5% of threshold
}

export interface AttendanceRecord {
  absence_type: 'present' | 'unexcused' | 'medical' | 'excused' | 'cancelled'
  class_date: string
}

export interface Subject {
  id: string
  name: string
  required_threshold: number
  personal_target: number | null
  total_classes_planned: number | null
}

export function calculateStats(
  subject: Subject,
  records: AttendanceRecord[]
): SubjectAttendanceStats {
  const activeRecords = records.filter(r => r.absence_type !== 'cancelled')
  const totalClasses = activeRecords.length
  const attended = activeRecords.filter(r => r.absence_type === 'present').length
  const medicalAbsences = activeRecords.filter(r => r.absence_type === 'medical').length
  const absent = totalClasses - attended
  
  const currentPercentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 100
  const threshold = subject.personal_target ?? subject.required_threshold
  const targetPct = threshold / 100

  let safeSkipsLeft: number | null = null;
  if (subject.total_classes_planned && subject.total_classes_planned > 0) {
    // If we know the total classes for the semester, calculate the true skip allowance
    const requiredAttendance = Math.ceil(targetPct * subject.total_classes_planned);
    const maxAllowedAbsences = subject.total_classes_planned - requiredAttendance;
    safeSkipsLeft = Math.max(0, maxAllowedAbsences - absent);
  } else {
    // Immediate safe skips: (attended) / (totalClasses + x) >= targetPct
    safeSkipsLeft = totalClasses > 0 
      ? Math.max(0, Math.floor((attended - targetPct * totalClasses) / targetPct))
      : null;
  }

  // Classes Needed to Recover: (attended + x) / (totalClasses + x) >= targetPct
  // x >= (targetPct * totalClasses - attended) / (1 - targetPct)
  let classesNeededToRecover: number | null = null
  if (currentPercentage < threshold) {
    classesNeededToRecover = Math.ceil((targetPct * totalClasses - attended) / (1 - targetPct))
  } else {
    classesNeededToRecover = 0
  }

  const remainingClasses = subject.total_classes_planned 
    ? Math.max(0, subject.total_classes_planned - totalClasses)
    : null

  let isGoalUnreachable = false
  let projectedFinalPercentage: number | null = null
  if (remainingClasses !== null) {
    const maxPossibleAttended = attended + remainingClasses
    const totalPlanned = totalClasses + remainingClasses
    const maxPossiblePct = (maxPossibleAttended / totalPlanned) * 100
    isGoalUnreachable = maxPossiblePct < subject.required_threshold

    // Projected: (attended + remainingClasses * currentRate) / totalPlanned
    const currentRate = totalClasses > 0 ? attended / totalClasses : 1
    projectedFinalPercentage = ((attended + remainingClasses * currentRate) / totalPlanned) * 100
  }

  const isInDangerZone = currentPercentage < (subject.required_threshold + 5)
  const isLastSafeAbsence = safeSkipsLeft === 1

  let healthStatus: 'safe' | 'caution' | 'danger' | 'unreachable' = 'safe'
  if (isGoalUnreachable) {
    healthStatus = 'unreachable'
  } else if (currentPercentage < subject.required_threshold || safeSkipsLeft === 0) {
    healthStatus = 'danger'
  } else if (currentPercentage < (subject.required_threshold + 5) || safeSkipsLeft === 1) {
    healthStatus = 'caution'
  }

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    totalClasses,
    attended,
    absent,
    medicalAbsences,
    currentPercentage,
    requiredThreshold: subject.required_threshold,
    personalTarget: subject.personal_target,
    remainingClasses,
    safeSkipsLeft,
    classesNeededToRecover,
    projectedFinalPercentage,
    healthStatus,
    isGoalUnreachable,
    isLastSafeAbsence,
    isInDangerZone
  }
}

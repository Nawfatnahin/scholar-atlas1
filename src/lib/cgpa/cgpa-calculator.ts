// /lib/cgpa/cgpa-calculator.ts — Pure calculation functions for CGPA Management

import type { GradeScaleMapping, ManualCourse, ClassTest, CTResult, CourseBreakdown, AutoCourse } from './cgpa-types';

/**
 * Calculate CGPA from manual courses using credit-hour weighted average.
 * CGPA = Σ(grade_point × credit_hours) / Σ(credit_hours)
 */
export function calculateManualCGPA(courses: ManualCourse[]): number {
  if (courses.length === 0) return 0;

  const totalWeighted = courses.reduce(
    (sum, c) => sum + Number(c.grade_point_obtained) * Number(c.credit_hours),
    0
  );
  const totalCredits = courses.reduce(
    (sum, c) => sum + Number(c.credit_hours),
    0
  );

  return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}

/**
 * Calculate weighted contribution of a single manual course.
 */
export function calculateWeightedContribution(course: ManualCourse): number {
  return Number(course.grade_point_obtained) * Number(course.credit_hours);
}

/**
 * Process class tests: sort by percentage, pick top M, calculate average.
 * Returns processed CT results with is_counted flag.
 */
export function processClassTests(
  classTests: ClassTest[],
  bestOf: number
): { results: CTResult[]; average: number } {
  if (classTests.length === 0) return { results: [], average: 0 };

  // Calculate percentage for each CT
  const withPercentage: CTResult[] = classTests.map((ct) => {
    const totalMarks = Number(ct.total_marks);
    const marksObtained = Number(ct.marks_obtained);
    const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
    return {
      ct_number: ct.ct_number,
      marks_obtained: marksObtained,
      total_marks: totalMarks,
      percentage,
      is_counted: false,
    };
  });

  // Sort by percentage descending
  const sorted = [...withPercentage].sort((a, b) => b.percentage - a.percentage);

  // Mark top M as counted
  const effectiveBestOf = Math.min(bestOf, sorted.length);
  const countedCTNumbers = new Set(
    sorted.slice(0, effectiveBestOf).map((ct) => ct.ct_number)
  );

  const results = withPercentage.map((ct) => ({
    ...ct,
    is_counted: countedCTNumbers.has(ct.ct_number),
  }));

  // Calculate average of counted CTs
  const countedPercentages = sorted.slice(0, effectiveBestOf).map((ct) => ct.percentage);
  const average =
    countedPercentages.length > 0
      ? countedPercentages.reduce((sum, p) => sum + p, 0) / countedPercentages.length
      : 0;

  return { results, average };
}

/**
 * Calculate assignment contribution.
 * contribution = (obtained / total) * weight
 */
export function calculateAssignmentContribution(
  obtained: number,
  total: number,
  weight: number
): number {
  if (total <= 0 || weight <= 0) return 0;
  return (obtained / total) * weight;
}

/**
 * Calculate attendance marks earned.
 * marks = (actual% / threshold%) * totalMarks, capped at totalMarks
 */
export function calculateAttendanceMarks(
  attendancePercentage: number,
  thresholdPercentage: number,
  totalMarks: number
): number {
  if (thresholdPercentage <= 0 || totalMarks <= 0) return 0;
  const ratio = attendancePercentage / thresholdPercentage;
  return Math.min(ratio * totalMarks, totalMarks);
}

/**
 * Calculate required exam percentage to meet a target grade.
 * 
 * currentWeightedScore = sum of all non-exam weighted contributions
 * targetTotalScore = the total score needed for the target grade point
 * examWeight = remaining weight percentage for the exam
 * 
 * requiredExamPercentage = (targetTotalScore - currentWeightedScore) / examWeight * 100
 */
export function calculateRequiredExamScore(
  currentWeightedScore: number,
  targetTotalScore: number,
  examWeight: number
): number {
  if (examWeight <= 0) return 0;
  return ((targetTotalScore - currentWeightedScore) / examWeight) * 100;
}

/**
 * Look up grade point from a total score using the grade scale.
 * The scale mappings should be sorted by threshold descending.
 * Returns the grade point for the first threshold the score meets or exceeds.
 */
export function lookupGradePoint(
  totalScore: number,
  mappings: GradeScaleMapping[]
): number {
  if (mappings.length === 0) return 0;

  // Sort by threshold descending
  const sorted = [...mappings].sort((a, b) => b.threshold - a.threshold);

  for (const mapping of sorted) {
    if (totalScore >= mapping.threshold) {
      return mapping.gradePoint;
    }
  }

  // Below all thresholds — return 0
  return 0;
}

/**
 * Calculate the full breakdown for a single auto course.
 */
export function calculateCourseBreakdown(
  course: AutoCourse,
  classTests: ClassTest[],
  attendancePercentage: number,
  gradeScaleMappings: GradeScaleMapping[]
): CourseBreakdown {
  // CT
  const { average: ctAverage } = processClassTests(classTests, course.ct_best_of);
  const ctContribution = (ctAverage * Number(course.ct_weight)) / 100;

  // Assignment
  const assignmentScore = calculateAssignmentContribution(
    Number(course.assignment_obtained),
    Number(course.assignment_total_marks),
    Number(course.assignment_weight)
  );

  // Attendance
  let attendanceMarks = 0;
  const attendanceMaxMarks = Number(course.attendance_total_marks);
  if (course.attendance_linked && attendanceMaxMarks > 0) {
    attendanceMarks = calculateAttendanceMarks(
      attendancePercentage,
      Number(course.attendance_threshold_percentage),
      attendanceMaxMarks
    );
  }
  const attendanceContribution =
    attendanceMaxMarks > 0
      ? (attendanceMarks / attendanceMaxMarks) * Number(course.attendance_weight)
      : 0;

  // Current weighted score (without exam)
  const currentWeightedScore = ctContribution + assignmentScore + attendanceContribution;

  // Exam weight
  const examWeight = Number(course.exam_weight);

  // Find target total score from grade scale
  // The target grade point needs to map back to the minimum score threshold
  const targetGradePoint = Number(course.target_grade_point);
  const sortedMappings = [...gradeScaleMappings].sort((a, b) => b.threshold - a.threshold);
  const targetMapping = sortedMappings.find((m) => m.gradePoint === targetGradePoint);
  const targetTotalScore = targetMapping ? targetMapping.threshold : 0;

  // Required exam percentage
  const requiredExamPercentage = calculateRequiredExamScore(
    currentWeightedScore,
    targetTotalScore,
    examWeight
  );

  const targetAchievable = requiredExamPercentage <= 100;
  const targetAlreadyAchieved = requiredExamPercentage < 0;

  // Predicted grade point (if user scores exactly the required exam marks)
  const predictedExamScore = Math.max(0, Math.min(100, requiredExamPercentage));
  const predictedTotalScore = currentWeightedScore + (predictedExamScore / 100) * examWeight;
  const predictedGradePoint = lookupGradePoint(predictedTotalScore, gradeScaleMappings);

  return {
    ctAverage,
    assignmentScore,
    attendanceMarks,
    attendanceMaxMarks,
    currentWeightedScore,
    requiredExamPercentage,
    examWeight,
    predictedGradePoint,
    targetAchievable,
    targetAlreadyAchieved,
  };
}

/**
 * Calculate overall automatic CGPA from all auto courses.
 * Uses credit-hour weighted average of predicted grade points.
 */
export function calculateAutoCGPA(
  courses: Array<{ creditHours: number; predictedGradePoint: number }>
): number {
  if (courses.length === 0) return 0;

  const totalWeighted = courses.reduce(
    (sum, c) => sum + c.predictedGradePoint * c.creditHours,
    0
  );
  const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);

  return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}

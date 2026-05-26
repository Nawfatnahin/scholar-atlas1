import sys
import io
import urllib.request
import urllib.error
import time
import datetime

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

TARGET_URL = "https://backlogger-academic.pages.dev"
COMMIT_MARKER = "5710e05"
CHECK_INTERVAL = 20
MAX_WAIT_MINUTES = 15

def get_time():
    return datetime.datetime.now().strftime("%H:%M:%S")

def check_deployment():
    try:
        req = urllib.request.Request(TARGET_URL, headers={"User-Agent": "JARVIS-Monitor/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            headers = dict(resp.headers)
            cf_ray = headers.get("cf-ray", "unknown")
            cache = headers.get("cf-cache-status", "unknown")
            return {"online": True, "status": status, "cf_ray": cf_ray, "cache": cache}
    except urllib.error.HTTPError as e:
        return {"online": False, "status": e.code, "error": str(e)}
    except Exception as e:
        return {"online": False, "status": 0, "error": str(e)}

def main():
    print(f"\n{'='*58}")
    print(f"  JARVIS DEPLOYMENT MONITOR -- Scholar Atlas")
    print(f"  Target : {TARGET_URL}")
    print(f"  Commit : {COMMIT_MARKER}")
    print(f"  Poll   : every {CHECK_INTERVAL}s  |  Timeout: {MAX_WAIT_MINUTES}min")
    print(f"{'='*58}\n")

    start = time.time()
    attempt = 0
    last_status = None

    while True:
        elapsed = time.time() - start
        if elapsed > MAX_WAIT_MINUTES * 60:
            print(f"\n[{get_time()}] TIMEOUT after {MAX_WAIT_MINUTES} minutes.")
            print("  Check manually: https://dash.cloudflare.com/")
            sys.exit(1)

        attempt += 1
        result = check_deployment()
        ts = get_time()

        if result["online"]:
            status_str = f"HTTP {result['status']} | CF-Ray: {result['cf_ray']} | Cache: {result['cache']}"
            if last_status != result["status"]:
                print(f"[{ts}] [ONLINE] {status_str}")
                last_status = result["status"]
            else:
                print(f"[{ts}] [CHECK #{attempt:03d}] {status_str}")

            if result["status"] == 200:
                elapsed_min = int(elapsed // 60)
                elapsed_sec = int(elapsed % 60)
                print(f"\n{'='*58}")
                print(f"  [LIVE] DEPLOYMENT CONFIRMED -- Scholar Atlas is live!")
                print(f"  Time elapsed : {elapsed_min}m {elapsed_sec}s")
                print(f"  URL          : {TARGET_URL}")
                print(f"  CF-Ray       : {result['cf_ray']}")
                print(f"{'='*58}\n")
                sys.exit(0)
        else:
            err = result.get("error", f"HTTP {result['status']}")
            if last_status != result["status"]:
                print(f"[{ts}] [BUILDING] {err}")
                last_status = result["status"]
            else:
                print(f"[{ts}] [CHECK #{attempt:03d}] Still building... ({err})")

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()

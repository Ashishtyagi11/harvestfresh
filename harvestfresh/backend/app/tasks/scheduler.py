import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.subscription_service import process_due_subscriptions

scheduler = AsyncIOScheduler()

async def daily_subscription_job():
    print("[APScheduler] Running daily subscription order generation job...")
    try:
        count = await process_due_subscriptions()
        print(f"[APScheduler] Successfully generated {count} subscription orders.")
    except Exception as e:
        print(f"[APScheduler ERROR] Failed subscription job: {e}")

def start_scheduler():
    # Run daily subscription job every day at midnight (or every 60 mins in dev)
    scheduler.add_job(daily_subscription_job, 'interval', minutes=60, id="daily_subscription_runner", replace_existing=True)
    scheduler.start()
    print("[APScheduler] Background scheduler started.")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[APScheduler] Scheduler stopped.")

import time
from functools import wraps


def log_time_decorator(func):
    """
    This decorator logs the execution time of any function it wraps.
    """

    @wraps(func)
    async def wrapper(*args, **kwargs):
        # 1. --- CODE TO RUN BEFORE THE FUNCTION ---
        start_time = time.time()
        print(f"Starting {func.__name__}...")

        # 2. --- RUN THE OG FUNCTION ---
        # We use 'await' since our endpoints are 'async'
        result = await func(*args, **kwargs)

        # 3. --- CODE TO RUN AFTER THE FUNCTION ---
        end_time = time.time()
        total_time = end_time - start_time
        print(f"Finished {func.__name__} in {total_time:.4f} seconds")

        # 4. --- RETURN THE OG RESULT ---
        return result

    return wrapper  # Return the new "wrapped" function

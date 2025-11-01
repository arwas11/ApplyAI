# 1. Start from an official, lightweight Python base image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy *only* the requirements file and install dependencies
# This step is cached, so it only re-runs if requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of your application code into the container
COPY . .

# 5. Tell Docker that the container will listen on port 8000
EXPOSE 8000

# 6. The command to run your app when the container starts
#    --host 0.0.0.0 is CRITICAL to make it accessible
CMD export PYTHONPATH=$PYTHONPATH:/app && uvicorn main:app --host 0.0.0.0 --port $PORT
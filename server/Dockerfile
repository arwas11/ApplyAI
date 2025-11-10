# Start from an official, lightweight Python base image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Add the /app directory to Python's search path
# This fixes "ModuleNotFoundError" by allowing main.py to import utils.py
ENV PYTHONPATH "${PYTHONPATH}:/app"

# Copy the requirements file *from the server subdirectory*
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire server directory *into* the /app directory
COPY server/ .

# Tell Docker that the container will listen on port 8000
EXPOSE 8000

# Use the shell form (no brackets) so the $PORT variable is read correctly
CMD uvicorn main:app --host 0.0.0.0 --port $PORT


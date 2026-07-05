# ============================================
# Frontend - Next.js
# ============================================
FROM node:22-alpine

# Set working directory
WORKDIR /app

RUN apk add curl

# Install dependencies first (better caching)
COPY package*.json .
RUN npm install


# Copy the rest of the source
COPY . .


# Run Next.js, allowing port to be overridden via env var
CMD ["sh", "-c", "npm run build && npm run start -- -p ${PORT:-3000}"]

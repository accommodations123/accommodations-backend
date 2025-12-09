# ---------- Stage 1: Build & install dependencies ----------
FROM node:18-alpine AS build
 
WORKDIR /backend-accommodations
 
# Copy dependency files
COPY package.json package-lock.json* ./
 
# Install all deps (including dev-deps if needed for build)
RUN npm ci --silent
 
# Copy the full source code
COPY . .
 
# If using TypeScript, build it here (uncomment if needed)
# RUN npm run build
 
 
# ---------- Stage 2: Production image ----------
FROM node:18-alpine AS production
 
WORKDIR /backend-accommodations
 
# Copy only package files first for clean prod install
COPY package.json package-lock.json* ./
 
# Install only production dependencies
RUN npm ci --silent --only=production
 
# Copy build output or JS source
COPY --from=build /backend-accommodations ./

ENV HOST=0.0.0.0

# Expose backend port
EXPOSE 5000
 
# Start the backend
CMD ["node", "-e", "require('./server.js').app.listen(process.env.PORT || 5000, '0.0.0.0')"]
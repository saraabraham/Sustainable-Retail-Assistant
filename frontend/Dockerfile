FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Set API URL as build arg and env var
ARG NEXT_PUBLIC_API_URL=http://sustainable-backend-76a1kk.westus.azurecontainer.io:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build with the env var
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]

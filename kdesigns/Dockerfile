# Optimized UI Dockerfile with security and performance improvements

# Use your secure base image directly (single-stage build)
FROM 035592488042.dkr.ecr.us-west-2.amazonaws.com/base_images/ubuntu_2025:nginxrootless

# Set working directory early
WORKDIR /usr/share/nginx/html/

# Copy nginx configuration first (changes less frequently for better layer caching)
COPY --chown=nginx:root web_server_conf/ /etc/nginx/

# Script file (changes rarely)
COPY --chown=nginx:root ./kxRunner.sh ./

# Copy application files in optimal order for Docker layer caching
# Environment file (changes rarely)
COPY --chown=nginx:root .env ./

# Application build artifacts (changes most frequently - copy last)
COPY --chown=nginx:root ./dist/ ./

# Set executable permissions in a single RUN layer
RUN chmod +x /usr/share/nginx/html/kxRunner.sh && \
    # Ensure nginx can read all files
    find /usr/share/nginx/html/ -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html/ -type d -exec chmod 755 {} \; && \
    # Make kxRunner.sh executable again after the find command
    chmod +x /usr/share/nginx/html/kxRunner.sh
    
# Use non-privileged port for rootless nginx
EXPOSE 8080

# Optimize CMD for better signal handling and process management
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/kxRunner.sh && nginx -g \"daemon off;\""]

# Add metadata labels for better image management
LABEL maintainer="kn-devops@klearnow.com" \
      version="2.0" \
      description="Optimized UI application with rootless nginx"
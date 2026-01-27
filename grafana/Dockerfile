FROM grafana/grafana:latest

# Copy provisioning files (datasources, dashboards)
COPY provisioning /etc/grafana/provisioning

# Optional: Pre-install plugins (comma-separated)
# ENV GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-worldmap-panel

# Fix permissions (Grafana runs as UID 472)
USER root
# RUN su root
RUN mkdir -p /var/lib/grafana/plugins /var/lib/grafana/dashboards && \
    chown -R 472:472 /var/lib/grafana /etc/grafana/provisioning && \
    chmod -R 755 /var/lib/grafana /etc/grafana/provisioning
USER 472

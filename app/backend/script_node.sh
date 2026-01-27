# #!/bin/sh

# # Exit immediately if a command exits with a non-zero status
# set -e

# NODE_EXPORTER_VERSION="latest"
# INSTALL_DIR="/usr/local/bin"
# SERVICE_FILE="/etc/systemd/system/node_exporter.service"

# echo "🚀 Installing Prometheus Node Exporter..."

# # 1. Create node_exporter user if not exists
# if ! id node_exporter &>/dev/null; then
#   echo "👤 Creating node_exporter user..."
#   useradd --no-create-home --shell /bin/false node_exporter
# else
#   echo "👤 node_exporter user already exists"
# fi

# # 2. Download Node Exporter
# cd /tmp
# echo "⬇️ Downloading Node Exporter..."
# wget -q https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-*.linux-amd64.tar.gz

# # 3. Extract files
# echo "📦 Extracting Node Exporter..."
# tar xvf node_exporter-*.linux-amd64.tar.gz

# # 4. Move binary
# echo "📂 Installing binary..."
# cp node_exporter-*.linux-amd64/node_exporter $INSTALL_DIR/
# chown node_exporter:node_exporter $INSTALL_DIR/node_exporter
# chmod 755 $INSTALL_DIR/node_exporter

# # 5. Create systemd service
# echo "🛠 Creating systemd service..."
# cat <<EOF > $SERVICE_FILE
# [Unit]
# Description=Prometheus Node Exporter
# Wants=network-online.target
# After=network-online.target

# [Service]
# User=node_exporter
# Group=node_exporter
# Type=simple
# ExecStart=$INSTALL_DIR/node_exporter

# [Install]
# WantedBy=multi-user.target
# EOF

# # 6. Start and enable service
# echo "🔄 Reloading systemd..."
# systemctl daemon-reexec
# systemctl daemon-reload

# echo "▶️ Starting Node Exporter..."
# systemctl start node_exporter
# systemctl enable node_exporter

# # 7. Verify service
# echo "✅ Checking service status..."
# systemctl status node_exporter --no-pager

# echo "🎉 Node Exporter installation completed!"
# echo "📊 Metrics available at: http://$(hostname -I | awk '{print $1}'):9100/metrics"

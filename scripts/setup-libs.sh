#!/bin/bash

echo "Installing Slack CLI..."
curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash

echo "Creating symbolic link for Slack CLI..."
USERNAME=$(whoami)
slack_cli_bin_path="/Users/$USERNAME/.slack/bin/slack"
sudo ln -sf "$slack_cli_bin_path" "/usr/local/bin/slack"

echo "Current username: $USERNAME"

echo "Installing Deno..."
brew install deno

echo "Installing Ngrok..."
brew install ngrok

echo "Opening Ngrok website..."
open https://ngrok.com

echo "All tasks completed successfully now you should signup for a free account on Ngrok website and get your auth token to use it."

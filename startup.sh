#!/bin/bash

echo "🚀 Starting Factagora on Azure App Service..."

# Node.js 버전 확인 (Node 24 LTS Krypton)
node --version
npm --version

# 환경 변수 확인
echo "NODE_ENV: $NODE_ENV"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"

# Next.js standalone 서버 실행
cd /home/site/wwwroot
node server.js

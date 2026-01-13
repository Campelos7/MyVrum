# Script para regenerar o Prisma Client
Write-Host "A regenerar o Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "Prisma Client regenerado com sucesso!" -ForegroundColor Green
Write-Host "Agora pode reiniciar o servidor com 'npm run dev'" -ForegroundColor Cyan


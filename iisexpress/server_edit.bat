@echo off
set @pwd=%cd%
set @newPath=%@pwd:\=\\%
set @cmd="powershell -Command %@cmd% ""(gc applicationhost.config) -replace 'G:\\MVHubOpen\\CoreSite\\iisexpress', '%@newPath%' |Out-File applicationhost.config"" "
echo "-------------------------------------"
echo %@cmd%
echo "-------------------------------------"
exit /b
%@cmd%

start http://localhost:8080/
"C:\Program Files (x86)\IIS Express\iisexpress" /config:./applicationhost.config /siteId:1
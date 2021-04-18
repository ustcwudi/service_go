addgroup -g 1000 -S $FTP_USER
adduser -u 1000 -D -G $FTP_USER -h /front -s /bin/false $FTP_USER
echo "$FTP_USER:$FTP_PASS" | /usr/sbin/chpasswd
chown -R $FTP_USER:$FTP_USER /front/

nginx &
vsftpd /app/vsftpd.conf &
/app/service

配置：腾讯云2G服务器，50G内存，2核CPU（意味着可以启用多线程）;
1、更新系统
'sudo apt update && sudo apt upgrade -y'

2、安装工具
'sudo apt install -y curl unzip git ufw nano'

3、开启防火墙
'''sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
'''

4、安装Nginx
Ghost需要Nginx作为反向代理。
'''sudo apt install -y nginx
   sudo systemctl enable nginx
   sudo systemctl start nginx
'''

5、检查Nginx是否运行
'systemctl status nginx'
如果显示'active(running)'，说明Nginx已经成功运行。

6、安装Node.js
Ghost需要Node.js运行环境，推荐使用Node.js20。
'''curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
'''

7、安装Ghost CLI(Ghost博客管理工具)
'''sudo npm install -g ghost-cli
'''
8、检查安装
'''node -v
   ghost -v
'''

9、安装Mysql
'''sudo apt install -y mysql-server
   sudo systemctl enable mysql
   sudo systemctl start mysql
'''

10、设置Mysql密码
'''sudo mysql_secure_installation
'''

按提示操作：
设定 root 用户密码

选择 Y（删除匿名用户）

选择 Y（禁用 root 远程登录）

选择 Y（移除测试数据库）

选择 Y（重新加载权限表）

11、创建Ghost数据库（ghost_db）
'sudo mysql -u root -p'

12、输入root密码后，执行：
'''
CREATE DATABASE ghost_db;
CREATE USER 'ghost_user'@'localhost' IDENTIFIED BY 'YourStrongPassword!';
GRANT ALL PRIVILEGES ON ghost_db.* TO 'ghost_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
'''

13、Ghost不能使用root用户运行，需要创建一个普通用户(后面的所有操作都要在这个用户下)
'''sudo adduser ghostadmin
sudo usermod -aG sudo ghostadmin
'''

14、切换到ghostadmin用户
'su - ghostadmin
'

15、安装Ghost，创建Ghost目录
'''sudo mkdir -p /var/www/ghost
sudo chown -R ghostadmin:ghostadmin /var/www/ghost
cd /var/www/ghost
'''

16、运行Ghost安装
'ghost install
'
博客 URL：https://yourdomain.com

数据库主机名：localhost

数据库名：ghost_db

数据库用户名：ghost_user

数据库密码：YourStrongPassword!

是否自动配置 Nginx？ Y

是否配置 SSL？ Y

是否创建 systemd 服务？ Y

Ghost 安装完成后会自动启动博客。

17、配置Nginx反向代理（如果没有自动配置）
'sudo nano /etc/nginx/sites-available/ghost'
写入以下内容（修改域名为你的实际域名）
'''server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:2368;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
'''
18、启用配置
'sudo ln -s /etc/nginx/sites-available/ghost /etc/nginx/sites-enabled/'

19、测试Nginx配置
'sudo nginx -t'

20、如果测试通过，重启Nginx
'sudo systemctl restart nginx'

21、配置HTTPS证书
如果Ghost安装时未自动申请HTTPS证书，可以手动安装Let's Encrypt
'''sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
'''
自动续期
'sudo certbot renew --dry-run'

22、配置Redis缓存，安装Redis
'''sudo apt install -y redis-server
   sudo systemctl enable redis
   sudo systemctl start redis
'''

23、配置Ghost使用Redis
'nano /var/www/ghost/config.production.json'

24、在"cache"部分修改
'''"cache": {
  "client": "redis",
  "connection": {
    "host": "127.0.0.1",
    "port": 6379
  }
}
'''

25、重启Ghost使Redis生效
'ghost restart'

基础框架就建成了！！！

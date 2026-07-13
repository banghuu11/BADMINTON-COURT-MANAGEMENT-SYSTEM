const bcrypt = require('bcrypt');
const hash = '$2b$10$eTCakPTbZvCxx9t2ELTeieqE5u4DETTsVHB4b15llhJJnpMjTu1Zu';
bcrypt.compare('password', hash).then(res => console.log('password:', res));
bcrypt.compare('123456', hash).then(res => console.log('123456:', res));

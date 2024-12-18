const cors = require('cors');

// 允许所有域名访问(开发环境)
app.use(cors());

// 或者指定允许的域名
app.use(cors({
  origin: ['http://localhost:3000', 'http://your-frontend-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})); 
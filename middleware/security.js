// Middleware de sécurité pour bloquer l'accès aux routes sensibles

export const securityMiddleware = (req, res, next) => {
  const url = req.url;
  
  // Liste des routes sensibles à bloquer
  const blockedRoutes = [
    '/admin',
    '/.env',
    '/config',
    '/node_modules',
    '/src',
    '/tests',
    '/.git',
    '/backup',
    '/database',
    '/logs',
    '/package.json',
    '/vite.config.js',
    '/playwright.config.cjs',
    '/.gitignore',
    '/yarn.lock',
    '/package-lock.json'
  ];
  
  // Bloquer les routes sensibles
  const isBlocked = blockedRoutes.some(route => 
    url.startsWith(route) || url.includes(route)
  );
  
  if (isBlocked) {
    res.status(403).json({
      error: 'Access Forbidden',
      message: 'Cette ressource n\'est pas accessible.',
      code: 'ROUTE_BLOCKED'
    });
    return;
  }
  
  // Bloquer les extensions sensibles
  const blockedExtensions = ['.env', '.config', '.log', '.git', '.gitignore'];
  const hasBlockedExtension = blockedExtensions.some(ext => url.endsWith(ext));
  
  if (hasBlockedExtension) {
    res.status(403).json({
      error: 'File Access Forbidden', 
      message: 'Ce type de fichier n\'est pas accessible.',
      code: 'FILE_BLOCKED'
    });
    return;
  }
  
  // Ajouter des headers de sécurité additionnels
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  next();
};

// Rate limiting avancé avec plusieurs niveaux
const requestCounts = new Map();
const suspiciousIPs = new Set();
const blockedIPs = new Set();
const whitelistedIPs = new Set(['127.0.0.1', '::1', 'localhost']);
const ddosProtection = new Map();

// Configuration du rate limiting avancée
const RATE_LIMITS = {
  normal: { window: 60000, max: 60 },      // 60 req/min pour utilisateurs normaux
  burst: { window: 10000, max: 20 },       // 20 req/10sec max burst
  suspicious: { window: 300000, max: 10 }, // 10 req/5min pour IPs suspectes
  api: { window: 60000, max: 30 },         // 30 req/min pour endpoints API
  assets: { window: 60000, max: 200 },     // 200 req/min pour les assets statiques
  upload: { window: 300000, max: 5 },      // 5 uploads/5min maximum
  search: { window: 60000, max: 20 }       // 20 recherches/min maximum
};

export const rateLimitMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const url = req.url;
  
  // Ignorer les IPs en whitelist
  if (whitelistedIPs.has(clientIP)) {
    next();
    return;
  }
  
  // Détection DDoS - plus de 1000 requêtes en 30 secondes
  const ddosKey = `${clientIP}_ddos`;
  if (!ddosProtection.has(ddosKey)) {
    ddosProtection.set(ddosKey, { count: 1, firstRequest: now });
  } else {
    const ddosData = ddosProtection.get(ddosKey);
    if (now - ddosData.firstRequest < 30000) {
      ddosData.count++;
      if (ddosData.count > 1000) {
        blockedIPs.add(clientIP);
        console.error(`🚫 DDoS détecté - IP bloquée: ${clientIP} (${ddosData.count} req/30s)`);
        res.status(429).json({
          error: 'DDoS Protection',
          message: 'Trop de requêtes détectées. IP bloquée.',
          code: 'DDOS_DETECTED'
        });
        return;
      }
    } else {
      ddosData.count = 1;
      ddosData.firstRequest = now;
    }
  }
  
  // Nettoyer les anciennes entrées
  for (const [ip, data] of requestCounts) {
    if (now - data.firstRequest > Math.max(...Object.values(RATE_LIMITS).map(r => r.window))) {
      requestCounts.delete(ip);
    }
  }
  
  // Vérifier si l'IP est bloquée
  if (blockedIPs.has(clientIP)) {
    res.status(429).json({
      error: 'IP Blocked',
      message: 'Votre adresse IP a été temporairement bloquée.',
      code: 'IP_BLOCKED'
    });
    return;
  }
  
  // Déterminer le type de limite selon l'endpoint
  let rateLimit = RATE_LIMITS.normal;
  
  if (suspiciousIPs.has(clientIP)) {
    rateLimit = RATE_LIMITS.suspicious;
  } else if (url.startsWith('/api/')) {
    rateLimit = RATE_LIMITS.api;
  } else if (url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    rateLimit = RATE_LIMITS.assets;
  } else if (url.startsWith('/upload') || url.includes('upload')) {
    rateLimit = RATE_LIMITS.upload;
  } else if (url.startsWith('/search') || url.includes('search')) {
    rateLimit = RATE_LIMITS.search;
  }
  
  // Initialiser ou mettre à jour les compteurs
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, {
      count: 1,
      firstRequest: now,
      burstCount: 1,
      lastBurst: now,
      violations: 0
    });
  } else {
    const clientData = requestCounts.get(clientIP);
    
    // Reset si la fenêtre est expirée
    if (now - clientData.firstRequest > rateLimit.window) {
      clientData.count = 1;
      clientData.firstRequest = now;
      clientData.violations = Math.max(0, clientData.violations - 1);
    } else {
      clientData.count++;
    }
    
    // Vérifier burst rate
    if (now - clientData.lastBurst > RATE_LIMITS.burst.window) {
      clientData.burstCount = 1;
      clientData.lastBurst = now;
    } else {
      clientData.burstCount++;
    }
    
    // Vérifier les violations
    if (clientData.count > rateLimit.max || clientData.burstCount > RATE_LIMITS.burst.max) {
      clientData.violations++;
      
      // Marquer comme suspect après 3 violations
      if (clientData.violations >= 3) {
        suspiciousIPs.add(clientIP);
        console.warn(`🚨 IP suspecte détectée: ${clientIP}`);
      }
      
      // Bloquer après 5 violations
      if (clientData.violations >= 5) {
        blockedIPs.add(clientIP);
        console.error(`🚫 IP bloquée: ${clientIP}`);
        
        // Auto-déblocage après 1 heure
        setTimeout(() => {
          blockedIPs.delete(clientIP);
          suspiciousIPs.delete(clientIP);
          requestCounts.delete(clientIP);
          console.log(`🔓 IP débloquée: ${clientIP}`);
        }, 3600000); // 1 heure
      }
      
      const retryAfter = Math.ceil((rateLimit.window - (now - clientData.firstRequest)) / 1000);
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Limite dépassée: ${clientData.count}/${rateLimit.max} requêtes`,
        retryAfter: retryAfter,
        violations: clientData.violations,
        code: 'RATE_LIMIT_EXCEEDED'
      });
      return;
    }
  }
  
  // Ajouter les headers de rate limiting
  const clientData = requestCounts.get(clientIP);
  res.setHeader('X-RateLimit-Limit', rateLimit.max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimit.max - clientData.count));
  res.setHeader('X-RateLimit-Reset', new Date(clientData.firstRequest + rateLimit.window).toISOString());
  res.setHeader('X-RateLimit-Policy', `${rateLimit.max};w=${rateLimit.window / 1000}`);
  
  if (suspiciousIPs.has(clientIP)) {
    res.setHeader('X-RateLimit-Status', 'suspicious');
  }
  
  next();
};

// Middleware de détection d'attaques
export const attackDetectionMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const url = req.url;
  
  // Patterns d'attaque courants
  const attackPatterns = [
    // Injection SQL
    /(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)/i,
    // XSS
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    // Path traversal
    /\.\.\/|\.\.\\|\.\.[\/\\]/,
    // Command injection
    /(\b(curl|wget|nc|netcat|bash|sh|cmd|powershell)\b)/i,
    // File inclusion
    /(php:\/\/|file:\/\/|data:\/\/)/i
  ];
  
  // User agents suspects
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /owasp/i,
    /masscan/i,
    /nuclei/i,
    /^\s*$/  // User agent vide
  ];
  
  // Vérifier les patterns d'attaque dans l'URL
  const hasAttackPattern = attackPatterns.some(pattern => pattern.test(url));
  const hasSuspiciousUA = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  
  if (hasAttackPattern || hasSuspiciousUA) {
    console.warn(`🚨 Tentative d'attaque détectée de ${clientIP}: ${url}`);
    console.warn(`   User-Agent: ${userAgent}`);
    
    // Ajouter à la liste suspecte
    suspiciousIPs.add(clientIP);
    
    res.status(403).json({
      error: 'Forbidden',
      message: 'Activité suspecte détectée.',
      code: 'ATTACK_DETECTED'
    });
    return;
  }
  
  next();
};

// Protection contre les attaques par force brute
const bruteForceProtection = new Map();

export const bruteForceProtectionMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Surveiller les tentatives de login
  if (req.url.includes('/login') || req.url.includes('/auth') || req.url.includes('/admin')) {
    const bruteKey = `${clientIP}_brute`;
    
    if (!bruteForceProtection.has(bruteKey)) {
      bruteForceProtection.set(bruteKey, { attempts: 0, firstAttempt: now, blocked: false });
    }
    
    const bruteData = bruteForceProtection.get(bruteKey);
    
    // Reset après 1 heure
    if (now - bruteData.firstAttempt > 3600000) {
      bruteData.attempts = 0;
      bruteData.firstAttempt = now;
      bruteData.blocked = false;
    }
    
    // Bloquer après 5 tentatives en 15 minutes
    if (bruteData.attempts >= 5 && (now - bruteData.firstAttempt) < 900000) {
      bruteData.blocked = true;
      suspiciousIPs.add(clientIP);
      
      res.status(429).json({
        error: 'Brute Force Protection',
        message: 'Trop de tentatives de connexion. Réessayez plus tard.',
        retryAfter: Math.ceil((900000 - (now - bruteData.firstAttempt)) / 1000),
        code: 'BRUTE_FORCE_DETECTED'
      });
      return;
    }
    
    if (req.method === 'POST') {
      bruteData.attempts++;
    }
  }
  
  next();
};

// Middleware de monitoring et logs de sécurité
export const securityMonitoringMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const now = new Date().toISOString();
  
  // Log des requêtes sensibles
  const sensitiveEndpoints = ['/admin', '/api/', '/login', '/auth', '/upload'];
  const isSensitive = sensitiveEndpoints.some(endpoint => req.url.startsWith(endpoint));
  
  if (isSensitive) {
    console.log(`🔍 [${now}] Requête sensible: ${req.method} ${req.url} from ${clientIP}`);
    console.log(`   User-Agent: ${userAgent}`);
  }
  
  // Log des IPs suspectes
  if (suspiciousIPs.has(clientIP)) {
    console.warn(`⚠️  [${now}] Requête d'IP suspecte: ${clientIP} -> ${req.url}`);
  }
  
  // Log des IPs bloquées
  if (blockedIPs.has(clientIP)) {
    console.error(`🚨 [${now}] Requête d'IP bloquée: ${clientIP} -> ${req.url}`);
  }
  
  next();
};
# Remote Network Testing Guide

This guide documents how to run the Transcendence project so that multiple computers on the same local network can access and play together.

## Overview

The project has been configured to accept connections from any computer on the local network at:

**Server URL:** `https://10.19.225.101:8443`

Users on other computers can connect to this URL to:

- Create accounts and login
- Access profiles and social features
- Play multiplayer games in real-time
- Use global chat

---

## Current Configuration

### Server Details

- **Server Computer:** palmiro's Mac
- **Server IP:** `10.19.225.101`
- **Port:** `8443` (HTTPS)
- **SSL Certificate:** Self-signed (users will see browser security warning)

### Changed Files

The following files were modified to enable remote access:

1. **`docker-compose.yml`** (line 196)
   - Changed `VITE_SERVER_HOST` from `localhost` to `10.19.225.101`
   - This bakes the server IP into the game client build

2. **`nginx-gateway/nginx.conf`** (lines 46, 258)
   - Changed `server_name localhost` to `server_name _` (catch-all)
   - Changed HTTP redirect from `$server_name` to `$host`
   - Now responds to requests from any IP/hostname

3. **`nginx-gateway/tools/ssl_cert_generator.sh`** (line 17)
   - Updated SSL certificate to include server IP as Subject Alternative Name
   - Added: `CN=10.19.225.101` and `subjectAltName=IP:10.19.225.101,DNS:localhost`

---

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Server computer's firewall allows port 8443
- All computers are on the same local network

### Step 1: Clean Previous Build

If you've run the project before, clean up the old configuration:

```bash
make clean
```

### Step 2: Regenerate Configuration

This will recreate docker-compose.yml with the new settings:

```bash
make config
```

### Step 3: Rebuild Everything

**IMPORTANT:** You must rebuild without cache to ensure the game client gets the new IP:

```bash
make rebuild
```

This command will:

- Build all Docker images from scratch
- Generate new SSL certificates with the server IP
- Start all services

**Expected time:** 5-10 minutes depending on your machine

### Step 4: Verify Server is Running

Check that all services are healthy:

```bash
make ps
```

You should see all containers with status "Up (healthy)"

### Step 5: Test Local Access

On the **server computer**, test access via:

- **Server IP:** `https://10.19.225.101:8443` ✅ (should work)
- **Localhost:** `https://localhost:8443` ✅ (should still work)

### Step 6: Test Remote Access

On a **different computer on the same network**:

1. Open a web browser
2. Navigate to: `https://10.19.225.101:8443`
3. Accept the security warning:
   - **Chrome:** Click "Advanced" → "Proceed to 10.19.225.101 (unsafe)"
   - **Firefox:** Click "Advanced" → "Accept the Risk and Continue"
   - **Safari:** Click "Show Details" → "visit this website"
4. The application should load

---

## Firewall Configuration

### macOS Firewall Settings

If remote computers cannot connect, check your Mac's firewall:

1. Open **System Settings** → **Network** → **Firewall**
2. Either:
   - **Option A (Simple):** Turn off firewall (only if on trusted network)
   - **Option B (Secure):** Add firewall rule for port 8443

#### Adding Firewall Rule (Terminal)

```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Add rule to allow port 8443 (if using application firewall)
# You may need to allow Docker in Firewall preferences
```

### Router/Network Considerations

- Both computers must be on the same subnet (e.g., both connected to same WiFi)
- If using VPN, disable it on both computers
- Some enterprise networks block custom ports - test on home network first

---

## Testing Checklist

After setup, verify these features work from remote computers:

### Authentication & Profile

- [ ] Can access the main page at `https://10.19.225.101:8443`
- [ ] Can create a new account
- [ ] Can login with credentials
- [ ] Can view and edit profile
- [ ] Can upload avatar

### Social Features

- [ ] Can send friend requests
- [ ] Can accept/reject friend requests
- [ ] Can view friends list
- [ ] Global chat WebSocket connects
- [ ] Can send and receive chat messages

### Game Features

- [ ] Can access game engine at `/game-engine/`
- [ ] WebSocket connection to game server succeeds
- [ ] Can create a game room
- [ ] Can join existing room
- [ ] Two players on different computers can play together
- [ ] Real-time game synchronization works
- [ ] Can play against AI opponent

### Monitoring

- [ ] Grafana accessible at `https://10.19.225.101:3001`
- [ ] Prometheus accessible at `http://10.19.225.101:9090`

---

## Troubleshooting

### Problem: Cannot connect from remote computer

**Symptoms:** "Connection refused" or "Cannot reach this page"

**Solutions:**

1. Verify server IP hasn't changed:

   ```bash
   ifconfig en0 | grep "inet "
   ```

   If IP changed, see "IP Address Changed" section below

2. Check firewall on server computer
3. Verify both computers are on same network:

   ```bash
   # On remote computer, try to ping server
   ping 10.19.225.101
   ```

4. Check Docker containers are running:
   ```bash
   make ps
   ```

### Problem: SSL Certificate Warning Every Time

**Symptoms:** Browser shows security warning on every visit

**Why:** Self-signed certificates are not trusted by browsers

**Solutions:**

1. **Accept it:** Click through warning each time (safest for testing)
2. **Import certificate:** Export the cert and add to system keychain (macOS only, complex)
3. **Use proper certificate:** Set up Let's Encrypt (requires public domain)

For testing purposes, option 1 is recommended.

### Problem: Game doesn't connect to WebSocket

**Symptoms:** Game loads but can't join rooms, or "Connection failed" error

**Checklist:**

1. Did you rebuild without cache? (`make rebuild`)
2. Check browser console for WebSocket errors
3. Verify game-frontend container is running: `docker ps | grep game-frontend`
4. Check game-service logs: `docker logs game-service`

**Common cause:** Forgot to rebuild after changing IP. The game client has the WebSocket URL baked in at build time.

### Problem: Global Chat Doesn't Connect

**Symptoms:** Chat interface loads but messages don't send/receive

**Solutions:**

1. Check browser console for WebSocket errors
2. Test auth token is valid (profile loads correctly)
3. Check nginx-gateway logs: `docker logs nginx-gateway`
4. Verify profile-service is healthy: `make ps`

### Problem: CORS Errors in Browser Console

**Symptoms:** API calls fail with CORS policy errors

**Note:** This shouldn't happen with current configuration, but if it does:

1. Check nginx.conf CORS headers (currently commented out)
2. Verify Origin header matches server URL
3. Check game server CORS setting in `game/server/src_serv/index.ts` (should be `origin: '*'`)

### Problem: Rooms Created on One Computer Not Visible to Others

**Symptoms:**

- Remote computer can see rooms list but rooms don't appear
- Rooms created on remote computer not visible from host
- Error: "room [ID] not found" when trying to join
- WebSocket connects but rooms are isolated per computer

**Root Cause:**
Game frontend Docker image was built before the server IP was configured in docker-compose.yml. The JavaScript bundle has `localhost` baked in instead of the server IP, causing each computer to connect to a different game server instance.

**Solution:**

1. **Verify the issue** - Check when image was built:

   ```bash
   docker image inspect transcendence-game-frontend:latest --format='{{.Created}}'
   ```

   If timestamp is before docker-compose.yml was updated, this is the issue.

2. **Fix: Rebuild with correct configuration:**

   ```bash
   # Full rebuild is required
   make clean
   make config
   make rebuild
   ```

3. **Verify the fix:**

   ```bash
   # Check that server IP is in the built bundle
   docker exec game-frontend sh -c "cat /usr/share/nginx/html/assets/*.js | grep -o '10\.19\.225\.101' | head -1"
   # Should output: 10.19.225.101

   # Verify port 2567 is NOT exposed externally
   docker port game-service
   # Should output nothing or only internal networking
   ```

4. **Test on both computers:**
   - Open browser console (F12) and navigate to game
   - Look for WebSocket connection URL
   - Should show: `wss://10.19.225.101:8443/ws/...` on BOTH computers
   - Create room on one computer, should be visible on other

**Why This Happens:**
Vite (the build tool for game-frontend) bakes environment variables into the JavaScript at **build time**, not runtime. If you update docker-compose.yml and restart containers without rebuilding the image, the old configuration remains in the bundle.

**Prevention:**
Always run `make rebuild` (not just `make restart`) when changing:

- `VITE_SERVER_HOST` in docker-compose.yml
- `VITE_SERVER_PORT` in docker-compose.yml
- Any other `VITE_*` environment variables

**Additional Fix Applied (March 8, 2026):**
Removed direct port 2567 exposure from game-service in docker-compose.yml to force all traffic through nginx gateway. This ensures consistent routing and prevents clients from bypassing the gateway.

### Problem: Authentication Fails with 403 Forbidden

**Symptoms:**

- Login/signup succeeds (returns 200 OK)
- Subsequent authenticated requests fail (403 Forbidden)
- Profile page shows "Forbidden" or blank/error state
- Browser console shows: `GET /api/profile/me 403 (Forbidden)`

**Root Cause:**
JWT signature mismatch between auth-service and profile-service. This typically happens after rebuilding services when:

- auth-service generates new JWT keypair at runtime
- profile-service uses older keys from shared volume
- Signature verification fails because keys don't match

**Diagnostic Steps:**

1. **Check profile-service logs for JWT errors:**

   ```bash
   docker logs profile-service 2>&1 | grep -i "jwt\|signature"
   ```

   If you see: `Error verifying access token: JsonWebTokenError: invalid signature` - this is the issue.

2. **Verify key sync between services:**

   ```bash
   # Compare MD5 checksums - should be identical
   docker exec auth-service md5sum /app/keys/jwt-public.pem
   docker exec profile-service md5sum /app/keys/jwt-public.pem
   ```

3. **Check auth-service is using shared keys:**
   ```bash
   docker inspect auth-service --format='{{range .Config.Env}}{{println .}}{{end}}' | grep JWT
   ```
   Should show:
   - `JWT_PRIVATE_KEY_PATH=/app/keys/jwt-private.pem`
   - `JWT_PUBLIC_KEY_PATH=/app/keys/jwt-public.pem`

**Solution:**

The fix ensures both services read from the same shared Docker volume (`keys:/app/keys`).

1. **Verify docker-compose.yml has JWT environment variables** (around line 155):

   ```yaml
   auth-service:
     environment:
       - JWT_PRIVATE_KEY_PATH=/app/keys/jwt-private.pem
       - JWT_PUBLIC_KEY_PATH=/app/keys/jwt-public.pem
   ```

2. **Recreate auth-service container:**

   ```bash
   docker compose up -d auth-service
   ```

3. **Verify both services use same keys:**

   ```bash
   docker exec auth-service md5sum /app/keys/jwt-public.pem && \
   docker exec profile-service md5sum /app/keys/jwt-public.pem
   ```

   Both checksums must match!

4. **Test authentication:**

   ```bash
   # Create test user
   curl -k -X POST https://localhost:8443/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@test.com","password":"Test@1234"}' \
     -c /tmp/cookies.txt

   # Test authenticated endpoint
   curl -k https://localhost:8443/api/profile/me -b /tmp/cookies.txt
   ```

   Should return user profile JSON (not 403)

**Why This Happens:**

- auth-service can generate JWT keys at multiple locations (`/app/jwt-*.pem` and `/app/keys/jwt-*.pem`)
- Without explicit path configuration, it may use locally generated keys instead of shared volume
- profile-service always reads from `/app/keys/jwt-public.pem` (shared volume)
- Mismatched keys cause signature verification to fail

**Prevention:**
Always specify JWT key paths explicitly in docker-compose.yml environment variables. The shared `keys` volume ensures both services use the same keypair.

---

## IP Address Changed

If the server computer's IP address changes (e.g., DHCP assigns new IP):

### Option A: Set Static IP (Recommended)

**macOS:**

1. **System Settings** → **Network**
2. Select your network interface (Wi-Fi or Ethernet)
3. Click **Details** → **TCP/IP**
4. Change "Configure IPv4" from **Using DHCP** to **Manually**
5. Set IP to `10.19.225.101` (or your current IP)
6. Set Subnet Mask (usually `255.255.255.0`)
7. Set Router IP (your router's IP, usually `10.19.225.1` or similar)
8. Click **OK** → **Apply**

### Option B: Update Configuration for New IP

1. Find new IP:

   ```bash
   ifconfig en0 | grep "inet " | awk '{print $2}'
   ```

2. Update files with new IP:
   - `docker-compose.yml` line 196: `VITE_SERVER_HOST`
   - `nginx-gateway/tools/ssl_cert_generator.sh` line 17: CN and subjectAltName

3. Delete old SSL certificate:

   ```bash
   docker volume rm transcendence_certs
   ```

4. Rebuild:
   ```bash
   make clean
   make config
   make rebuild
   ```

---

## Performance Considerations

### Expected Performance

- **2-4 players:** Excellent performance, no lag
- **5-10 players:** Good performance, minor lag possible
- **10+ players:** May experience slowdown (SQLite bottleneck)

### Limitations

- **Database:** SQLite is single-threaded, not optimized for high concurrency
- **Network:** Performance depends on local network quality
- **Resources:** Server computer should have adequate RAM (8GB+ recommended)

### Monitoring

Access Grafana dashboard to monitor:

- Container resource usage
- Response times
- WebSocket connections
- Database query performance

**Grafana URL:** `https://10.19.225.101:3001`

- Username: `grafana_admin` (from .env)
- Password: `change_me_please` (from .env)

---

## Security Notes

### Current Security Posture

- ✅ **HTTPS:** All traffic encrypted via TLS
- ✅ **JWT Authentication:** Secure token-based auth
- ✅ **Session Management:** Proper token refresh flow
- ⚠️ **Self-signed Certificate:** Not trusted by browsers
- ⚠️ **Local Network Only:** Not exposed to internet
- ⚠️ **Permissive CORS:** Game server allows all origins

### For Production Use

If deploying beyond testing, consider:

1. **Proper SSL Certificate:**
   - Use Let's Encrypt for free trusted certificates
   - Requires public domain name

2. **Restrict CORS:**
   - Update `game/server/src_serv/index.ts` line 14
   - Change from `origin: '*'` to specific domain

3. **Database:**
   - Migrate from SQLite to PostgreSQL/MySQL for better concurrency
   - Add database backups

4. **Secrets:**
   - Generate strong values for `.env` secrets:
     - `JWT_SECRET`
     - `SERVICE_TOKEN`
     - `GRAFANA_ADMIN_PASSWORD`
   - Use `openssl rand -hex 64` to generate

5. **Rate Limiting:**
   - Add rate limiting to NGINX
   - Protect against brute force attacks

6. **Firewall:**
   - Keep firewall enabled
   - Only allow specific IP ranges
   - Consider VPN for remote access

---

## Reverting to Localhost-Only

To revert back to localhost-only mode:

1. **Update docker-compose.yml** line 196:

   ```yaml
   VITE_SERVER_HOST: localhost
   ```

2. **Update nginx.conf** lines 46, 258:

   ```nginx
   server_name localhost;
   ```

   And line 259:

   ```nginx
   return 301 https://$server_name$request_uri;
   ```

3. **Update ssl_cert_generator.sh** line 17:

   ```bash
   -subj "/C=ES/ST=Barcelona/L=Barcelona/O=42/OU=Education/CN=localhost"
   ```

   (Remove `-addext` line)

4. **Rebuild:**
   ```bash
   make clean
   make config
   make rebuild
   ```

---

## Alternative Configurations

### Using Hostname Instead of IP

If you want to use a hostname like `transcendence.local`:

1. **Server computer:** Set hostname in System Settings
2. **Client computers:** Add to `/etc/hosts`:
   ```
   10.19.225.101  transcendence.local
   ```
3. **Update all configs** to use `transcendence.local` instead of `10.19.225.101`
4. **Rebuild** as above

### Port Forwarding for Internet Access

**WARNING:** This exposes your server to the internet. Only do this if you understand the security implications.

1. **Router configuration:**
   - Forward external port → 10.19.225.101:8443
   - Use non-standard external port (e.g., 44443)

2. **Dynamic DNS:**
   - Set up DDNS service (e.g., No-IP, DynDNS)
   - Get hostname like `mygame.ddns.net`

3. **Update configurations:**
   - Use DDNS hostname instead of local IP
   - Update SSL certificate for public hostname

4. **Security hardening:**
   - Change all default passwords
   - Enable rate limiting
   - Restrict CORS
   - Monitor access logs
   - Consider WAF (Web Application Firewall)

---

## Quick Reference

### Essential Commands

```bash
# Start the server
make up

# Stop the server
make down

# Rebuild everything (after IP change)
make rebuild

# View logs
make logs

# Check container status
make ps

# Clean everything (keeps data)
make clean

# Clean everything (deletes data)
make clean-hard
```

### Important URLs

| Service     | URL                                       | Notes                 |
| ----------- | ----------------------------------------- | --------------------- |
| Main App    | `https://10.19.225.101:8443`              | Primary access point  |
| Game Engine | `https://10.19.225.101:8443/game-engine/` | Embedded in main app  |
| Grafana     | `https://10.19.225.101:3001`              | Monitoring dashboards |
| Prometheus  | `http://10.19.225.101:9090`               | Metrics (HTTP only)   |

### Service Ports (Internal)

| Service            | Internal Port | External Port | Access   |
| ------------------ | ------------- | ------------- | -------- |
| nginx-gateway      | 443           | 8443          | Public   |
| frontend           | 3000          | 3000          | Dev only |
| auth-service       | 8081          | -             | Internal |
| game-service       | 2567          | 2567          | Dev only |
| game-frontend      | 80            | 8088          | Dev only |
| profile-service    | 5000          | -             | Internal |
| statistics-service | 6000          | -             | Internal |
| prometheus         | 9090          | 9090          | Public   |
| grafana            | 3000          | 3001          | Public   |

---

## Use Case: Prompt for AI Assistance

If you need to configure remote access on a different IP or troubleshoot issues, use this prompt:

```
I need to configure the 42-transcendence project for remote network access.

Current situation:
- Server IP: [YOUR_IP_HERE]
- Docker Compose project running with microservices architecture
- NGINX gateway on port 8443 with self-signed SSL
- Game client built with Vite (needs IP at build time)

Files that need IP configuration:
1. docker-compose.yml - VITE_SERVER_HOST build arg (line 196)
2. nginx-gateway/nginx.conf - server_name directives (lines 46, 258)
3. nginx-gateway/tools/ssl_cert_generator.sh - SSL cert CN and SAN (line 17)

Requirements:
- Support access from multiple computers on local network
- Both server and remote clients should work
- Game WebSocket connections must work
- Minimize changes to codebase

Please update these files with the server IP and explain the rebuild process.
```

---

## Support & Further Reading

### Project Documentation

- Main README: `README.md`
- Architecture: `docs/architecture.md`
- API Docs: `docs/api/`

### Docker Commands

- Docker Compose Docs: https://docs.docker.com/compose/
- Docker Networking: https://docs.docker.com/network/

### NGINX Configuration

- NGINX Docs: https://nginx.org/en/docs/
- WebSocket Proxying: https://nginx.org/en/docs/http/websocket.html

### SSL/TLS

- OpenSSL: https://www.openssl.org/docs/
- Let's Encrypt: https://letsencrypt.org/

---

## Changelog

### 2026-03-08 - Initial Configuration

- Configured for IP: `10.19.225.101`
- Updated docker-compose.yml game-frontend build args
- Updated nginx.conf server_name to catch-all
- Enhanced SSL certificate with IP SAN
- Created this documentation

### 2026-03-08 - Multiplayer Room Connection Fix

- **Issue:** Rooms created on one computer not visible to others
- **Root Cause:** Game frontend was built before IP configuration was updated
- **Fix Applied:**
  - Removed direct port 2567 exposure from game-service (all traffic now flows through nginx)
  - Rebuilt game-frontend image with correct server IP (`10.19.225.101`) baked into bundle
  - Updated troubleshooting documentation with this known issue
- **Verification:** Server IP now appears in game client JavaScript bundle
- **Result:** All computers now connect to same game server instance, rooms are shared

### 2026-03-08 - JWT Authentication Fix

- **Issue:** HTTP 403 Forbidden on `/api/profile/me` after successful login/signup
- **Symptoms:** Login/signup returned 200 OK, but subsequent authenticated requests failed
- **Root Cause:** JWT key path mismatch between auth-service and profile-service
  - auth-service generated new keys at `/app/jwt-*.pem` during rebuild
  - profile-service read public key from shared volume at `/app/keys/jwt-public.pem`
  - Different keys caused signature verification failures
- **Technical Detail:** `JsonWebTokenError: invalid signature` in profile-service logs
- **Fix Applied:**
  - Added environment variables to auth-service in docker-compose.yml:
    - `JWT_PRIVATE_KEY_PATH=/app/keys/jwt-private.pem`
    - `JWT_PUBLIC_KEY_PATH=/app/keys/jwt-public.pem`
  - Recreated auth-service container to apply new configuration
- **Verification:**
  - Both services now use identical JWT keys (verified via MD5 checksums)
  - `/api/profile/me` endpoint returns 200 OK with user profile data
  - No more JWT signature errors in logs
- **Result:** Authentication now works correctly for both local and remote users

---

## Contact

For issues or questions about this configuration, refer to the main project README or check logs:

```bash
# All services
make logs

# Specific service
docker logs [service-name]

# Follow logs in real-time
docker logs -f [service-name]
```

---

**Last Updated:** 2026-03-08  
**Server IP:** 10.19.225.101  
**Configuration Status:** ✅ Ready for remote testing

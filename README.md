<!-- path: README.md -->

# namecheap-manager

A minimal CLI tool to manage Namecheap DNS records and domain privacy (WhoisGuard) from your terminal.

## Features

* **Domain listing**: View all domains in your Namecheap account.
* **DNS management**: List, add, and delete DNS records for any domain.
* **WhoisGuard (Domain Privacy)**: Check status, enable, and disable privacy protection.
* **Docker wrapper**: Includes a lightweight `nc` script to run without installing Node.js locally.

## Table of Contents

* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)

    * [CLI Commands](#cli-commands)
    * [Docker Wrapper (`nc`)](#docker-wrapper-nc)
* [Examples](#examples)
* [Development](#development)
* [Contributing](#contributing)
* [License](#license)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/andreas-glaser/namecheap-manager.git
   cd namecheap-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Make CLI executable**

   ```bash
   chmod +x src/cli.js
   ```

4. (Optional) **Install globally**

   ```bash
   npm link
   # now you can use `namecheap-manager` from anywhere
   ```

## Configuration

Create a `config.json` or use environment variables to provide your Namecheap API credentials.

```json
{
  "apiUser": "YOUR_API_USER",
  "apiKey":  "YOUR_API_KEY",
  "userName": "YOUR_ACCOUNT_USER",
  "clientIp": "YOUR_SERVER_IP",
  "endpoint": "https://api.namecheap.com/xml.response"
}
```

> **Note:** Make sure `clientIp` matches the IP address permitted in your Namecheap API settings.

## Usage

### CLI Commands

| Command                                         | Description                                            |
| ----------------------------------------------- | ------------------------------------------------------ |
| `domains:list`                                  | List all domains in your account                       |
| `dns:list <domain>`                             | Show DNS records for `<domain>`                        |
| `dns:add <domain> <name> <type> <value> [opts]` | Add a DNS record                                       |
| `dns:delete <domain> <hostId...>`               | Delete one or more records by Host ID                  |
| `privacy:status <domain>`                       | Show WhoisGuard status (ENABLED, DISABLED, NOTPRESENT) |
| `privacy:enable <domain>`                       | Enable WhoisGuard for a domain                         |
| `privacy:disable <domain>`                      | Disable WhoisGuard for a domain                        |

Use the `--help` flag for detailed options:

```bash
namecheap-manager dns:add --help
```

### Docker Wrapper (`nc`)

If you prefer not to install Node.js locally, use the `nc` script. It runs the CLI inside Docker:

```bash
./nc domains:list
./nc dns:add example.com @ A 203.0.113.42 --ttl 5m
./nc privacy:enable mydomain.com
```

## Examples

```bash
# List domains
namecheap-manager domains:list --page 1 --size 50

# Show records for example.com
namecheap-manager dns:list example.com

# Add an A record
namecheap-manager dns:add example.com www A 198.51.100.123 --ttl 60m

# Delete records
namecheap-manager dns:delete example.com 1234 5678

# Check privacy status
namecheap-manager privacy:status example.com

# Enable WhoisGuard
namecheap-manager privacy:enable example.com

# Disable WhoisGuard
namecheap-manager privacy:disable example.com
```

## Development

1. **Run tests** (if applicable)

   ```bash
   npm test
   ```
2. **Lint & Format**

   ```bash
   npm run lint
   npm run format
   ```

## Contributing

Contributions are welcome! Please open issues and submit pull requests for any improvements.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-command`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to your branch (`git push origin feature/new-command`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

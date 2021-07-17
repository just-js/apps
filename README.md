# Demo Apps

A selection of demonstration apps that can be run using just runtime or compiled into standalone executables.

When building, you can also pass --cleanall argument to clean all dependent modules, e.g.

```
just build --clean --cleanall download.js
```

## download.js

download a file over http/1.1 on a TLS 1.3 tcp connection

```
just build --clean download.js
./download https://github.com/just-js/just/archive/refs/tags/0.0.22.tar.gz
```

## mini.js

- minimal static application with smallest set of dependencies possible.  has a custom configuration file (mini.config.js)
- tries to load shared libraries and dump the api of each one

```
just build --clean mini.js
./mini
```

## readelf.js

- read elf header from and elf file

```
just build --clean readelf.js
./readelf ./readelf
```

## sniff.js

- very simple packet sniffer

```
just build --clean sniff.js
sudo ./sniff lo
```

## techempower.js

- techempower benchmark web server. single threaded. you can run multiple processes listening on same address/port.
- configuration options are in tfbconfig.js. this will be compiled into the executable and not loaded from disk at runtime

```
just build --clean techempower.js
./techempower
```

- test the endpoints

```
curl -vvv http://127.0.0.1:8080/plaintext
curl -vvv http://127.0.0.1:8080/json
curl -vvv http://127.0.0.1:8080/db
curl -vvv http://127.0.0.1:8080/query?q=10
curl -vvv http://127.0.0.1:8080/update?q=10
curl -vvv http://127.0.0.1:8080/fortunes
curl -vvv http://127.0.0.1:8080/cached-worlds?q=10
```

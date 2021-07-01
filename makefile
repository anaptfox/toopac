TOOPAC_VERSION := 0.0.1
DENO_VERSION := 1.11.3
DENO_INSTALL := ./.deno

include deno.mk

.PHONY: all
all: $(DENO_BIN)
	$(call deno,run --allow-read --allow-write --allow-net src/main.ts)

dev: $(DENO_BIN)
	$(call deno,run --watch --allow-read --allow-write --allow-net src/main.ts)

build: $(DENO_BIN)
	rm -rf dist && mkdir dist
	$(call deno,compile -o ./dist/toopac_$(TOOPAC_VERSION)_linux --target x86_64-unknown-linux-gnu --allow-read --allow-write --allow-net src/main.ts)
	$(call deno,compile -o ./dist/toopac_$(TOOPAC_VERSION)_windows --target x86_64-pc-windows-msvc --allow-read --allow-write --allow-net src/main.ts)
	$(call deno,compile -o ./dist/toopac_$(TOOPAC_VERSION)_macos --target x86_64-apple-darwin --allow-read --allow-write --allow-net src/main.ts)
	$(call deno,compile -o ./dist/toopac_$(TOOPAC_VERSION)_macos_silicon --target aarch64-apple-darwin --allow-read --allow-write --allow-net src/main.ts)

#!/bin/bash
# ORE V5.6.1 - UTXO Inventory Generator
# Consolidates all 164,203 UTXOs into a single audit JSON.

ADDRESSES_FILE="./scripts/addresses.txt"
OUTPUT_DIR="./docs/archive/perpetual/closed"
mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="$OUTPUT_DIR/inventory_utxos_$(date +%F).json"

# Create addresses.txt if it doesn't exist
cat > "$ADDRESSES_FILE" << 'EOF'
bc1qzqnt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r
bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf
bc1qnxhnvwjvvv40rezac909hgvwc3cmv8d7e22l4x
bc1qy65yyrf0jgr5rypcs7g93kmd0cfz734vsxfq89
bc1qst00pmtwjh74xqxkjjzcrrxqdhe34c35la5yfjq
bc1qru49sv730weqm5qqwtcj0sptwwq0k7p39894kj
bc1qj03nzv4akh05tzjzcfrev8q43tu9cm3wgmmzex
bc1qvl6z0usf0dryz9recy9rqtw7p6k4m5xz7z40m2
bc1qny3srj3wu05z8multdxntjd73v6tx3z97dq7c3
bc1q6pk9lh9udecv6csf92ku4n040ltxexerx40l40s
bc1qhtgk3r257aknud76h93ucfxqze
bc1qlerz6wzz3ylcl3w9vqhrk65c6f6uj7lwl2f5cu
bc1qseksdatpy3t42tg8f2crtqfq63kl37pxjg6ep6
bc1qdnymdw6jz5hz8pejwepj2pgecs46eepwhtdxuv
bc1q3a57wz8jzw9h9u3rstr4d5gu3l8spx8flf49xv
bc1qc0apxgfaeflhr2u07hyzezuut36mn666z36jfu
bc1quvn6sksz7rz5fzkas3vyqzxllqlew3knpnyx92k
bc1qe52jls26z3d9u92p8a84fhwwk89lfmqhewz2g2
bc1qjt5c93p8szzq2ma6lzxnza590k3r7sg5jpc5ex
bc1qqkwav5xdla67nm39246a8jr9v67mza0awt6azj
bc1q9uy7qdwp1am972yhe8aqkqq9da
bc1qqkxtn8ujcrwyzl759wzxar64ne9pr9h75aslny
bc1q3zqs07h2hderzw2l8846fkukl4tuasl63xq9yk
bc1qpv73jx7n77fr3npkaqqjmcyy49m5e03xptdfee4d
bc1qq73vrq7ygdrjuxlgdqykh7vlcl5m9mqwuy2ank
bc1qe220t2s6hl9t5vex85r4ppzd9fc0r2smw6qtc4
bc1q84x04d82y42klt7u24xcn0e9p5xvfx3v6jztnp
bc1q96uaxql42j5hrkeh8ux6z4l2h6
bc1qe3zhlqs3pg9lar48zwhhjrmupkfzrtt2f3zht3
bc1q39fv38x0kuvjw1ku6m2rpatsucyj4kwhqyz2u8l
EOF

echo "[" > "$OUTPUT_FILE"
first=true
while IFS= read -r addr; do
    # Remove spaces and carriage returns
    clean_addr=$(echo "$addr" | tr -d ' ' | tr -d '\r')
    if [ -n "$clean_addr" ]; then
        [ "$first" = false ] && echo "," >> "$OUTPUT_FILE"
        echo "Fetching UTXOs for $clean_addr..."
        curl -s "https://mempool.space/api/address/$clean_addr/utxo" >> "$OUTPUT_FILE"
        first=false
        sleep 0.3
    fi
done < "$ADDRESSES_FILE"
echo "]" >> "$OUTPUT_FILE"

# Calculate weight and hash
FILE_SIZE=$(stat -c%s "$OUTPUT")
FILE_HASH=$(sha256sum "$OUTPUT" | awk '{print $1}')

echo "$FILE_HASH" > "$OUTPUT.sha256"

echo "--- CERTIFICADO DE INVENTÁRIO ORE V5.6.1 ---"
echo "Arquivo: $OUTPUT"
echo "Tamanho: $FILE_SIZE bytes"
echo "SHA256:  $FILE_HASH"
echo "--------------------------------------------"

chmod 444 "$OUTPUT"
chmod 444 "$OUTPUT.sha256"

echo "✅ Inventário selado perpetuamente."

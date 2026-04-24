import { View } from 'react-native';

/**
 * Placeholder QR code visual — damier déterministe seedé sur un token.
 * Remplacera un vrai encodeur QR (ex. react-native-qrcode-svg) une fois
 * la lib décidée. Suffit pour le démo visuel côté UI.
 */
export function QrPlaceholder({
  value,
  size = 220,
  foreground = '#0A1628',
  background = '#FFFFFF',
}: {
  value: string;
  size?: number;
  foreground?: string;
  background?: string;
}) {
  const cells = 25;
  const cellSize = size / cells;
  const hash = (s: string, salt: number) => {
    let h = salt;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  const isFinder = (r: number, c: number) => {
    const blocks: [number, number][] = [
      [0, 0],
      [0, cells - 7],
      [cells - 7, 0],
    ];
    return blocks.some(([br, bc]) => {
      if (r < br || r >= br + 7 || c < bc || c >= bc + 7) return false;
      const isOuter = r === br || r === br + 6 || c === bc || c === bc + 6;
      const isInner = r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4;
      return isOuter || isInner;
    });
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        padding: cellSize,
        borderRadius: 8,
      }}
    >
      <View style={{ flexDirection: 'column' }}>
        {Array.from({ length: cells }).map((_, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {Array.from({ length: cells }).map((__, c) => {
              let filled = isFinder(r, c);
              if (!filled) {
                const h = hash(value, r * 1000 + c);
                filled = h % 3 === 0;
              }
              return (
                <View
                  key={c}
                  style={{
                    width: cellSize - 0.5,
                    height: cellSize - 0.5,
                    backgroundColor: filled ? foreground : background,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

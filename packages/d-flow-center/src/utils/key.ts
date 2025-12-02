export class KeyMapper {
  static readonly keyCodeMap: Record<number, string> = {
    // 字母键
    0: 'A',
    1: 'S',
    2: 'D',
    3: 'F',
    4: 'H',
    5: 'G',
    6: 'Z',
    7: 'X',
    8: 'C',
    9: 'V',
    11: 'B',
    12: 'Q',
    13: 'W',
    14: 'E',
    15: 'R',
    16: 'Y',
    17: 'T',
    31: 'O',
    32: 'U',
    34: 'I',
    35: 'P',
    37: 'L',
    38: 'J',
    40: 'K',
    45: 'N',
    46: 'M',

    // 功能键
    49: 'Space',
    36: 'Return',
    48: 'Tab',
    51: 'Delete',
    53: 'Escape',

    // 修饰键（左侧）
    55: 'Left Command ⌘',
    56: 'Left Shift ⇧',
    58: 'Left Option ⌥',
    59: 'Left Control ⌃',

    // 修饰键（右侧）
    54: 'Right Command ⌘',
    60: 'Right Shift ⇧',
    61: 'Right Option ⌥',
    62: 'Right Control ⌃',

    // Fn 键
    63: 'Fn',
  }

  // 反向映射：从字符串到键码
  static readonly stringToKeyCodeMap: Record<string, number> = (() => {
    const map: Record<string, number> = {}
    for (const [code, name] of Object.entries(KeyMapper.keyCodeMap)) {
      const keyCode = Number(code)
      map[name] = keyCode
      map[name.toUpperCase()] = keyCode

      if (name.includes('Left Command')) {
        map['Left Cmd'] = keyCode
        map['LCmd'] = keyCode
      } else if (name.includes('Right Command')) {
        map['Right Cmd'] = keyCode
        map['RCmd'] = keyCode
      } else if (name.includes('Left Shift')) {
        map['LShift'] = keyCode
      } else if (name.includes('Right Shift')) {
        map['RShift'] = keyCode
      } else if (name.includes('Left Option')) {
        map['LOpt'] = keyCode
        map['Left Alt'] = keyCode
      } else if (name.includes('Right Option')) {
        map['ROpt'] = keyCode
        map['Right Alt'] = keyCode
      } else if (name.includes('Left Control')) {
        map['LCtrl'] = keyCode
      } else if (name.includes('Right Control')) {
        map['RCtrl'] = keyCode
      }
    }
    return map
  })()

  // 将字符串组合转换为键码数组
  static parseKeyString(keyString: string): number[] | null {
    const trimmed = keyString.trim()
    const keys = trimmed.split('+').map((k) => k.trim())
    const keyCodes = keys
      .map((k) => this.stringToKeyCodeMap[k])
      .filter((c) => c !== undefined)
    return keyCodes.length === keys.length ? keyCodes : null
  }

  static keyCodeToString(keyCode: number): string {
    return this.keyCodeMap[keyCode] ?? `Key(${keyCode})`
  }

  static keyCodesToString(keyCodes: number[]): string {
    return keyCodes
      .map((c) => this.keyCodeMap[c])
      .filter(Boolean)
      .join('+')
  }

  // 获取按键优先级（用于排序）
  private static keyPriority(keyName: string): number {
    if (keyName.includes('Fn')) return 0
    if (keyName.includes('Control') || keyName.includes('⌃')) return 1
    if (keyName.includes('Option') || keyName.includes('⌥')) return 2
    if (keyName.includes('Shift') || keyName.includes('⇧')) return 3
    if (keyName.includes('Command') || keyName.includes('⌘')) return 4
    return 5
  }

  // 按标准顺序排序按键码
  static sortKeyCodes(keyCodes: number[]): number[] {
    return [...keyCodes].sort(
      (a, b) =>
        this.keyPriority(this.keyCodeToString(a)) -
        this.keyPriority(this.keyCodeToString(b)),
    )
  }

  // 获取按键的显示文本（简化符号）
  static getDisplayText(keyName: string): string {
    if (keyName.includes('Command') || keyName.includes('⌘')) return '⌘'
    if (keyName.includes('Option') || keyName.includes('⌥')) return '⌥'
    if (keyName.includes('Control') || keyName.includes('⌃')) return '⌃'
    if (keyName.includes('Shift') || keyName.includes('⇧')) return '⇧'
    if (keyName === 'Space') return 'Space'
    if (keyName === 'Return') return '↩'
    if (keyName === 'Delete') return '⌫'
    if (keyName === 'Escape') return '⎋'
    if (keyName === 'Tab') return '⇥'
    return keyName
  }

  // 排序并缩短按键数组（用于显示）
  static formatKeys(keys: string[]): string[] {
    return [...keys]
      .sort((a, b) => this.keyPriority(a) - this.keyPriority(b))
      .map(this.getDisplayText)
  }
}

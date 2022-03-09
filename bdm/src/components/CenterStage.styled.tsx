import styled from 'styled-components'

export default styled.div<{ hor?: boolean; ver?: boolean; padding?: string }>(
  ({ hor = true, ver = true, padding = '' }) => {
    const y = ver ? '50%' : '0'
    const x = hor ? '50%' : '0'
    return `
      position: absolute;
      top: ${y};
      left: ${x};
      transform: translate(-${x}, -${y});
      ${padding ? `padding: ${padding}` : ''}
    `
  }
)

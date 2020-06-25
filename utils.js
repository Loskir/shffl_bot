const escapeHtml = (string) => {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function formatHTML(text = '', entities = []) {
  const chars = escapeHtml(text || '')
  const available = [...(entities || [])]
  const opened = []
  const result = []
  // eslint-disable-next-line unicorn/no-for-loop
  for (let offset = 0; offset < chars.length; ++offset) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const index = available.findIndex((entity) => entity.offset === offset)
      if (index === -1) {
        break
      }
      const entity = available[index]
      // eslint-disable-next-line default-case
      switch (entity.type) {
        case 'bold':
          result.push('<b>')
          break
        case 'italic':
          result.push('<i>')
          break
        case 'code':
          result.push('<code>')
          break
        case 'pre':
          if (entity.language) {
            result.push(`<pre><code class="language-${entity.language}">`)
          } else {
            result.push('<pre>')
          }
          break
        case 'strikethrough':
          result.push('<s>')
          break
        case 'underline':
          result.push('<u>')
          break
        case 'text_mention':
          result.push(`<a href="tg://user?id=${entity.user.id}">`)
          break
        case 'text_link':
          result.push(`<a href="${entity.url}">`)
          break
      }
      opened.unshift(entity)
      available.splice(index, 1)
    }

    result.push(chars[offset])

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const index = opened.findIndex((entity) => entity.offset + entity.length - 1 === offset)
      if (index === -1) {
        break
      }
      const entity = opened[index]
      // eslint-disable-next-line default-case
      switch (entity.type) {
        case 'bold':
          result.push('</b>')
          break
        case 'italic':
          result.push('</i>')
          break
        case 'code':
          result.push('</code>')
          break
        case 'pre':
          if (entity.language) {
            result.push('</code></pre>')
          } else {
            result.push('</pre>')
          }
          break
        case 'strikethrough':
          result.push('</s>')
          break
        case 'underline':
          result.push('</u>')
          break
        case 'text_mention':
        case 'text_link':
          result.push('</a>')
          break
      }
      opened.splice(index, 1)
    }
  }
  return result.join('')
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

module.exports = {
  escapeHtml,
  formatHTML,

  shuffle,
}

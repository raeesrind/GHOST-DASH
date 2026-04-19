// RREmbedModal + ReactionRolesPanel replacement
// PART 1: RREmbedModal
function RREmbedModal({ embed, onChange, onClose }) {
  const [openSections, setOpenSections] = React.useState({})
  const inp = {
    background: RR.card2, border: `1px solid ${RR.border}`, borderRadius: 6,
    padding: '9px 12px', color: '#ccc', fontSize: 13, width: '100%',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function setField(patch) { onChange({ ...embed, ...patch }) }

  function addField() {
    onChange({ ...embed, fields: [...(embed.fields || []), { name: '', value: '', inline: false }] })
  }
  function updateField(i, patch) {
    const fields = embed.fields.map((f, idx) => idx === i ? { ...f, ...patch } : f)
    onChange({ ...embed, fields })
  }
  function removeField(i) {
    onChange({ ...embed, fields: embed.fields.filter((_, idx) => idx !== i) })
  }

  const SectionToggle = ({ id, label, children }) => (
    <div style={{ borderTop: `1px solid ${RR.border}`, paddingTop: 12, marginTop: 4 }}>
      <button
        onClick={() => toggleSection(id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0, marginBottom: openSections[id] ? 12 : 0 }}
      >
        <span style={{ color: RR.accent, fontSize: 16, lineHeight: 1, fontWeight: 700 }}>
          {openSections[id] ? '⊖' : '⊕'}
        </span>
        <span style={{ color: RR.text2, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
      </button>
      {openSections[id] && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>}
    </div>
  )

  const previewColor = embed.color || '#cc2222'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: RR.card, border: `1px solid ${RR.border}`, borderRadius: 12,
        width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto',
        padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ color: RR.text2, fontSize: 12, fontStyle: 'italic' }}>* All fields are optional</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: RR.text2, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Color */}
          <div>
            <RRLabel>Color</RRLabel>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => document.getElementById('rr-embed-color-input').click()}
                style={{ padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: RR.card2, border: `1px solid ${RR.border}`, color: RR.text1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 3, background: previewColor, display: 'inline-block', border: '1px solid #555' }} />
                Choose Color
              </button>
              <input
                id="rr-embed-color-input"
                type="color"
                value={embed.color || '#cc2222'}
                onChange={e => setField({ color: e.target.value })}
                style={{ width: 0, height: 0, opacity: 0, position: 'absolute', pointerEvents: 'none' }}
              />
              <input
                value={embed.color || ''}
                onChange={e => setField({ color: e.target.value })}
                placeholder="#cc2222"
                style={{ ...inp, width: 120 }}
              />
            </div>
          </div>

          {/* Title + Title URL */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <RRLabel>Title</RRLabel>
              <input value={embed.title || ''} onChange={e => setField({ title: e.target.value })} placeholder="Embed title" style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <RRLabel>Title URL</RRLabel>
              <input value={embed.title_url || ''} onChange={e => setField({ title_url: e.target.value })} placeholder="https://..." style={inp} />
            </div>
          </div>

          {/* Description */}
          <div>
            <RRLabel>Description</RRLabel>
            <textarea
              value={embed.description || ''}
              onChange={e => setField({ description: e.target.value })}
              placeholder="Embed description..."
              rows={4}
              style={{ ...inp, resize: 'vertical' }}
            />
          </div>

          {/* Author */}
          <SectionToggle id="author" label="Author">
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <RRLabel>Author Name</RRLabel>
                <input value={embed.author_name || ''} onChange={e => setField({ author_name: e.target.value })} placeholder="Author name" style={inp} />
              </div>
              <div style={{ flex: 1 }}>
                <RRLabel>Author Icon URL</RRLabel>
                <input value={embed.author_icon || ''} onChange={e => setField({ author_icon: e.target.value })} placeholder="https://..." style={inp} />
              </div>
            </div>
          </SectionToggle>

          {/* Image / Thumb */}
          <SectionToggle id="image" label="Image / Thumb">
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <RRLabel>Image URL</RRLabel>
                <input value={embed.image_url || ''} onChange={e => setField({ image_url: e.target.value })} placeholder="https://..." style={inp} />
              </div>
              <div style={{ flex: 1 }}>
                <RRLabel>Thumbnail URL</RRLabel>
                <input value={embed.thumbnail_url || ''} onChange={e => setField({ thumbnail_url: e.target.value })} placeholder="https://..." style={inp} />
              </div>
            </div>
          </SectionToggle>

          {/* Footer */}
          <SectionToggle id="footer" label="Footer">
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <RRLabel>Footer Text</RRLabel>
                <input value={embed.footer_text || ''} onChange={e => setField({ footer_text: e.target.value })} placeholder="Footer text" style={inp} />
              </div>
              <div style={{ flex: 1 }}>
                <RRLabel>Footer Icon URL</RRLabel>
                <input value={embed.footer_icon || ''} onChange={e => setField({ footer_icon: e.target.value })} placeholder="https://..." style={inp} />
              </div>
            </div>
          </SectionToggle>

          {/* Fields */}
          <SectionToggle id="fields" label="Fields">
            {(embed.fields || []).map((field, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: RR.card2, borderRadius: 6, padding: 10, border: `1px solid ${RR.border}` }}>
                <div style={{ flex: 1 }}>
                  <RRLabel>Name</RRLabel>
                  <input value={field.name || ''} onChange={e => updateField(i, { name: e.target.value })} placeholder="Field name" style={inp} />
                </div>
                <div style={{ flex: 2 }}>
                  <RRLabel>Value</RRLabel>
                  <input value={field.value || ''} onChange={e => updateField(i, { value: e.target.value })} placeholder="Field value" style={inp} />
                </div>
                <div style={{ flexShrink: 0, paddingTop: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: RR.text2, fontSize: 12 }}>
                    <input type="checkbox" checked={!!field.inline} onChange={e => updateField(i, { inline: e.target.checked })} />
                    Inline
                  </label>
                </div>
                <button onClick={() => removeField(i)} style={{ background: 'none', border: 'none', color: RR.textDis, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '18px 0 0', flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button
              onClick={addField}
              style={{ background: 'none', border: `1px dashed ${RR.border}`, borderRadius: 6, padding: '7px 16px', color: RR.text2, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              + Add Field
            </button>
          </SectionToggle>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{ padding: '9px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: RR.accent, border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              Save Embed
            </button>
          </div>

          {/* Preview */}
          {(embed.title || embed.description || embed.author_name || embed.footer_text) && (
            <div>
              <RRLabel>Preview</RRLabel>
              <div style={{
                background: '#2f3136', borderRadius: 4, padding: '12px 16px',
                borderLeft: `4px solid ${previewColor}`, maxWidth: 440,
              }}>
                {embed.author_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {embed.author_icon && <img src={embed.author_icon} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} onError={e => e.target.style.display='none'} />}
                    <span style={{ color: '#dcddde', fontSize: 13, fontWeight: 600 }}>{embed.author_name}</span>
                  </div>
                )}
                {embed.title && (
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                    {embed.title_url ? <a href={embed.title_url} style={{ color: '#00b0f4', textDecoration: 'none' }}>{embed.title}</a> : embed.title}
                  </div>
                )}
                {embed.description && (
                  <div style={{ color: '#dcddde', fontSize: 13, lineHeight: 1.5, marginBottom: 6, whiteSpace: 'pre-wrap' }}>{embed.description}</div>
                )}
                {embed.thumbnail_url && (
                  <img src={embed.thumbnail_url} alt="" style={{ float: 'right', width: 80, height: 80, objectFit: 'cover', borderRadius: 4, marginLeft: 12 }} onError={e => e.target.style.display='none'} />
                )}
                {(embed.fields || []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {embed.fields.map((f, i) => (
                      <div key={i} style={{ flex: f.inline ? '0 0 calc(33% - 4px)' : '0 0 100%' }}>
                        <div style={{ color: '#dcddde', fontSize: 13, fontWeight: 700 }}>{f.name}</div>
                        <div style={{ color: '#b9bbbe', fontSize: 13 }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                )}
                {embed.image_url && (
                  <img src={embed.image_url} alt="" style={{ width: '100%', borderRadius: 4, marginTop: 8 }} onError={e => e.target.style.display='none'} />
                )}
                {(embed.footer_text || embed.footer_icon) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #40444b' }}>
                    {embed.footer_icon && <img src={embed.footer_icon} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }} onError={e => e.target.style.display='none'} />}
                    <span style={{ color: '#72767d', fontSize: 12 }}>{embed.footer_text}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// PART 2: ReactionRolesPanel

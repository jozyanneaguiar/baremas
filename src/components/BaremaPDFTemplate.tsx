import React, { forwardRef } from 'react';
import { BaremaData } from '../types';
import { EVALUATION_ITEMS } from '../data/evaluationItems';
import { LOGO_ADVENTISTA_SRC } from '../assets/logoAdventista';
import { ASSINATURA_JOZY_SRC } from '../assets/assinaturaJozy';

interface Props {
  data: BaremaData;
  totalScore: number;
}

export const BaremaPDFTemplate = forwardRef<HTMLDivElement, Props>(({ data, totalScore }, ref) => {
  const getScoreForItem = (itemId: number): number => {
    const item = EVALUATION_ITEMS.find((i) => i.id === itemId);
    const sel = data.selections[itemId];
    if (!item || !sel) return 0;
    return item.options[sel]?.score ?? 0;
  };

  const formatNumber = (num: number) => {
    return num.toString().replace('.', ',');
  };

  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        minHeight: '1123px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontSize: '12px',
      }}
    >
      <div>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            borderBottom: '2px solid #0F3966',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Educação Adventista Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img
                src={LOGO_ADVENTISTA_SRC}
                alt="Educação Adventista Logo"
                style={{ height: '48px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
            </div>

            <div style={{ color: '#0F3966', fontWeight: 'bold', lineHeight: '1.2' }}>
              <span
                style={{
                  fontSize: '20px',
                  display: 'block',
                  letterSpacing: '0.05em',
                  fontWeight: 800,
                  color: '#092543',
                }}
              >
                UNIAENE
              </span>
              <span
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  color: '#0F3966',
                  fontWeight: 500,
                  display: 'block',
                }}
              >
                CENTRO UNIVERSITÁRIO ADVENTISTA DE ENSINO DO NORDESTE
              </span>
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              color: '#0F3966',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Núcleo de pós-graduação – NPGUniaene
          </div>
        </div>

        {/* Dark Blue Banner */}
        <div
          style={{
            backgroundColor: '#0F3966',
            color: '#ffffff',
            textAlign: 'center',
            padding: '8px 16px',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
          }}
        >
          <div>BAREMA DE CORREÇÃO – TRABALHO DE CONCLUSÃO DE CURSO</div>
          <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', marginTop: '2px' }}>
            MEMORIAL REFLEXIVO
          </div>
        </div>

        {/* Info Rows */}
        <div
          style={{
            backgroundColor: '#f0f6fc',
            border: '1px solid #9bbfe5',
            borderRadius: '2px',
            marginBottom: '12px',
            fontSize: '12px',
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              display: 'flex',
              borderBottom: '1px solid #9bbfe5',
            }}
          >
            <span style={{ fontWeight: 'bold', width: '112px', color: '#092543' }}>
              PROGRAMA:
            </span>
            <span style={{ flex: 1, fontWeight: 600, textTransform: 'uppercase' }}>
              {data.programa || 'PÓS-GRADUAÇÃO'}
            </span>
          </div>
          <div
            style={{
              padding: '6px 12px',
              display: 'flex',
              borderBottom: '1px solid #9bbfe5',
            }}
          >
            <span style={{ fontWeight: 'bold', width: '112px', color: '#092543' }}>
              PARECERISTA:
            </span>
            <span style={{ flex: 1, fontWeight: 600, textTransform: 'uppercase' }}>
              {data.parecerista || 'Jozy Anne Miranda Aguiar Castro'}
            </span>
          </div>
          <div style={{ padding: '6px 12px', display: 'flex' }}>
            <span style={{ fontWeight: 'bold', width: '112px', color: '#092543' }}>
              ACADÊMICO(A):
            </span>
            <span style={{ flex: 1, fontWeight: 600, textTransform: 'uppercase' }}>
              {data.academico || 'Nome do Acadêmico'}
            </span>
          </div>
        </div>

        {/* Evaluation Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #0F3966',
            fontSize: '11px',
            marginBottom: '12px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#9BBFE5',
                color: '#092543',
                fontWeight: 'bold',
                borderBottom: '1px solid #0F3966',
                textAlign: 'center',
              }}
            >
              <th
                style={{
                  padding: '8px 4px',
                  borderRight: '1px solid #0F3966',
                  width: '28px',
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: '8px 12px',
                  borderRight: '1px solid #0F3966',
                  textAlign: 'left',
                }}
              >
                Itens a serem observados
              </th>
              <th
                style={{
                  padding: '8px 4px',
                  borderRight: '1px solid #0F3966',
                  width: '96px',
                }}
              >
                Atende plenamente
              </th>
              <th
                style={{
                  padding: '8px 4px',
                  borderRight: '1px solid #0F3966',
                  width: '96px',
                }}
              >
                Atende parcialmente
              </th>
              <th
                style={{
                  padding: '8px 4px',
                  borderRight: '1px solid #0F3966',
                  width: '80px',
                }}
              >
                Não atende
              </th>
              <th style={{ padding: '8px 4px', width: '56px' }}>Nota</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATION_ITEMS.map((item, idx) => {
              const selectedOpt = data.selections[item.id];
              const score = getScoreForItem(item.id);
              const isEven = idx % 2 === 0;

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #9bbfe5',
                    backgroundColor: isEven ? '#f4f8fc' : '#ffffff',
                  }}
                >
                  <td
                    style={{
                      padding: '6px 4px',
                      borderRight: '1px solid #9bbfe5',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#092543',
                    }}
                  >
                    {item.id}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      borderRight: '1px solid #9bbfe5',
                      color: '#111827',
                      fontSize: '10.5px',
                      lineHeight: '1.25',
                    }}
                  >
                    {item.description}
                  </td>
                  <td
                    style={{
                      padding: '6px 4px',
                      borderRight: '1px solid #9bbfe5',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '2px',
                          border: selectedOpt === 'A' ? '1px solid #1d4ed8' : '1px solid #9ca3af',
                          backgroundColor: selectedOpt === 'A' ? '#2563eb' : '#ffffff',
                          color: selectedOpt === 'A' ? '#ffffff' : 'transparent',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '6px 4px',
                      borderRight: '1px solid #9bbfe5',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '2px',
                          border: selectedOpt === 'B' ? '1px solid #1d4ed8' : '1px solid #9ca3af',
                          backgroundColor: selectedOpt === 'B' ? '#2563eb' : '#ffffff',
                          color: selectedOpt === 'B' ? '#ffffff' : 'transparent',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '6px 4px',
                      borderRight: '1px solid #9bbfe5',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '2px',
                          border: selectedOpt === 'C' ? '1px solid #1d4ed8' : '1px solid #9ca3af',
                          backgroundColor: selectedOpt === 'C' ? '#2563eb' : '#ffffff',
                          color: selectedOpt === 'C' ? '#ffffff' : 'transparent',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#092543',
                      fontSize: '12px',
                    }}
                  >
                    {formatNumber(score)}
                  </td>
                </tr>
              );
            })}
            <tr
              style={{
                backgroundColor: '#0F3966',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              <td
                colSpan={5}
                style={{
                  padding: '8px 12px',
                  textAlign: 'right',
                  paddingRight: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                NOTA FINAL
              </td>
              <td
                style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  color: '#fcd34d',
                  fontWeight: 800,
                  fontSize: '16px',
                  borderLeft: '1px solid #1e40af',
                }}
              >
                {formatNumber(totalScore)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Blocks Division Summary */}
        <div
          style={{
            fontSize: '10px',
            color: '#1f2937',
            borderTop: '1px solid #d1d5db',
            borderBottom: '1px solid #d1d5db',
            paddingTop: '8px',
            paddingBottom: '8px',
            marginTop: '8px',
            marginBottom: '8px',
            lineHeight: '1.4',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              color: '#092543',
              fontSize: '12px',
              marginBottom: '4px',
            }}
          >
            DIVISÃO DOS ITENS POR BLOCOS AVALIATIVOS:
          </div>
          <div>• Itens 1 e 2: referentes à <strong>formação acadêmica</strong> (valor por item: 1,0)</div>
          <div>• Itens 3 ao 5: referentes à <strong>trajetória profissional</strong> (valor por item: 1,0 / 1,5)</div>
          <div>• Item 6: referentes à <strong>considerações reflexivas</strong> (valor do item: 1,0)</div>
          <div>• Itens 7 ao 9: referentes às <strong>normas da ABNT</strong> (valor por item: 0,5 / 1,0)</div>
          <div>• Itens 10 ao 12: referentes à <strong>linguagem acadêmica</strong> (valor por item: 0,5)</div>
        </div>
      </div>

      {/* Signature Section */}
      <div
        style={{
          border: '1px solid #0F3966',
          padding: '12px',
          borderRadius: '2px',
          backgroundColor: '#f8fafc',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {/* Digital Signature Seal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #60a5fa',
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '2px solid #2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '10px',
              }}
            >
              🔒
            </div>
            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#092543',
                  textTransform: 'uppercase',
                }}
              >
                Assinatura Digital
              </div>
              <div style={{ fontSize: '8px', color: '#4b5563' }}>Autenticidade Validada</div>
            </div>
          </div>

          {/* Signature Content */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '380px', margin: '0 auto' }}>
            <div style={{ fontSize: '10px', color: '#374151', fontWeight: 500, marginBottom: '2px' }}>
              Assinatura do(a) parecerista:
            </div>
            {/* Signature Image above the line */}
            <div
              style={{
                borderBottom: '1px solid #1f2937',
                paddingBottom: '2px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                minHeight: '52px',
              }}
            >
              <img
                src={ASSINATURA_JOZY_SRC}
                alt="Assinatura Parecerista"
                style={{ maxHeight: '52px', maxWidth: '300px', width: 'auto', height: 'auto', display: 'block', margin: '0 auto', objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                marginTop: '4px',
                fontWeight: 'bold',
                color: '#092543',
                fontSize: '11px',
              }}
            >
              {data.parecerista
                ? data.parecerista.toLowerCase().includes('m.a')
                  ? data.parecerista
                  : `M.a ${data.parecerista}`
                : 'M.a Jozy Anne Miranda Aguiar Castro'}
            </div>
            <div style={{ fontSize: '9px', color: '#374151' }}>
              E-mail: jozy.castro10@gmail.com
            </div>
            <div style={{ fontSize: '9px', color: '#1e40af', textDecoration: 'underline' }}>
              http://lattes.cnpq.br/6516631352288006
            </div>
          </div>

          {/* Date */}
          <div style={{ textAlign: 'right', fontSize: '10px', fontWeight: 'bold', color: '#092543' }}>
            <div>Data: {data.data || new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

BaremaPDFTemplate.displayName = 'BaremaPDFTemplate';


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/Card';
import { Input, TextArea } from '../components/Input';
import { Toggle } from '../components/Toggle';
import { Metric } from '../components/Metric';
import { ClipboardIcon, ClipboardCheckIcon, SparklesIcon } from '../components/Icons';
import { formatCurrencyBRL, formatIntegerBRL } from '../utils/formatters';
import { docxParser } from '../utils/docxtemplater-parser';
import { REVISION_DEFAULTS } from '../constants';

const RevisionCalculator: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [consultant, setConsultant] = useState('');
  const [observations, setObservations] = useState('');
  const [wordCount, setWordCount] = useState<number>(REVISION_DEFAULTS.WORD_COUNT);
  const [pricePerWord, setPricePerWord] = useState<number>(REVISION_DEFAULTS.PRICE_PER_WORD);
  const [applyDiscount, setApplyDiscount] = useState(REVISION_DEFAULTS.APPLY_DISCOUNT);
  const [discountPercentage, setDiscountPercentage] = useState<number>(REVISION_DEFAULTS.DISCOUNT_PERCENTAGE);
  const [installments, setInstallments] = useState<number>(REVISION_DEFAULTS.INSTALLMENTS);
  
  const [salesScript, setSalesScript] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const deliveryDays = REVISION_DEFAULTS.DELIVERY_DAYS;

  const calculations = useMemo(() => {
    const basePrice = wordCount * pricePerWord;
    const discountRate = applyDiscount ? discountPercentage / 100 : 0;
    const discountAmount = basePrice * discountRate;
    const finalPrice = basePrice - discountAmount;
    const installmentValue = finalPrice > 0 ? finalPrice / installments : 0;

    const today = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + deliveryDays);
    
    const quoteDateStr = today.toLocaleDateString('pt-BR');
    const deliveryDateStr = deliveryDate.toLocaleDateString('pt-BR');

    const installmentText = `${installments}x sem juros de ${formatCurrencyBRL(installmentValue)} cada`;

    return {
      basePrice,
      discountAmount,
      finalPrice,
      installmentValue,
      quoteDateStr,
      deliveryDateStr,
      installmentText,
      effectiveDiscount: applyDiscount && discountPercentage > 0
    };
  }, [wordCount, pricePerWord, applyDiscount, discountPercentage, installments]);
  
  useEffect(() => {
    const { basePrice, discountAmount, finalPrice, installmentText, quoteDateStr, deliveryDateStr, effectiveDiscount } = calculations;
    const templateScript = `Olá! 😊 Segue o orçamento da revisão ortográfica e gramatical (data: ${quoteDateStr}):

• Cliente: ${clientName || "-"}
• Consultor: ${consultant || "-"}
• Contagem de palavras: ${formatIntegerBRL(wordCount)}
• Preço base: ${formatCurrencyBRL(basePrice)}
• Desconto aplicado: ${effectiveDiscount ? `${discountPercentage.toFixed(1)}%` : "— (não aplicado)"}
• Valor do desconto: ${formatCurrencyBRL(discountAmount)}
• Valor final: ${formatCurrencyBRL(finalPrice)}
• Condição de pagamento: ${installmentText}
• Prazo estimado de entrega: ${deliveryDays} dias (até ${deliveryDateStr})

Observações: ${observations || "-"}`.trim();
    setSalesScript(templateScript);
    // We only want to reset the AI error if the user changes the data, indicating a new context.
    setAiError(null);
  }, [clientName, consultant, wordCount, discountPercentage, observations, calculations, deliveryDays]);


  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(salesScript).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [salesScript]);

  const handleGenerateAiScript = async () => {
      setIsAiGenerating(true);
      setAiError(null);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const { finalPrice, installmentText, deliveryDateStr, effectiveDiscount } = calculations;
        
        const prompt = `
        Crie uma mensagem de vendas amigável e profissional para ser enviada por WhatsApp para um potencial cliente.
        
        **Contexto:** Você é um consultor de serviços editoriais oferecendo uma revisão de texto. O objetivo é apresentar o orçamento de forma clara, destacar o valor do serviço e incentivar o cliente a prosseguir.
        
        **Use os seguintes dados para personalizar a mensagem:**
        - Nome do Cliente: ${clientName || "Prezado(a) Cliente"}
        - Nome do Consultor: ${consultant || "Nosso consultor"}
        - Contagem de Palavras: ${formatIntegerBRL(wordCount)} palavras
        - Valor Final do Orçamento: ${formatCurrencyBRL(finalPrice)}
        - Condições de Pagamento: ${installmentText}
        - Desconto Oferecido: ${effectiveDiscount ? `${discountPercentage.toFixed(1)}%` : "Nenhum desconto especial desta vez, mas o valor já é competitivo."}
        - Data de Entrega Prevista: ${deliveryDateStr}
        - Observações Adicionais: ${observations || "Nenhuma"}

        **Requisitos para a mensagem:**
        1.  **Tom de Voz:** Profissional, mas acessível e encorajador. Use emojis de forma sutil para criar uma conexão.
        2.  **Estrutura:** Comece com uma saudação personalizada. Apresente o resumo do orçamento. Destaque 1 ou 2 benefícios chave de uma revisão profissional (ex: clareza, credibilidade, impacto da mensagem). Termine com uma chamada para ação clara (ex: "Podemos seguir com o aceite?", "Alguma dúvida que eu possa esclarecer?").
        3.  **Clareza:** Evite jargões. Seja direto e transparente sobre os valores e prazos.
        4.  **Não invente informações:** Baseie-se estritamente nos dados fornecidos.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;
        if (text) {
            setSalesScript(text.trim());
        } else {
            throw new Error("A IA não retornou um texto válido.");
        }
      } catch (error) {
          console.error("AI script generation error:", error);
          setAiError("Falha ao gerar o script com IA. Verifique sua chave de API e tente novamente.");
      } finally {
          setIsAiGenerating(false);
      }
  };

  const generateDocx = async () => {
    setIsGeneratingDocx(true);
    setDocxError(null);

    try {
      const PizZip = (window as any).PizZip;
      const docxtemplater = (window as any).docxtemplater;
      const saveAs = (window as any).saveAs;

      if (!PizZip || !docxtemplater || !saveAs) {
        throw new Error('Bibliotecas de geração de DOCX não carregadas. Verifique os scripts no HTML.');
      }

      const response = await fetch('/templates/modelo_revisao.docx');
      if (!response.ok) {
        throw new Error(`Modelo não encontrado em '/templates/modelo_revisao.docx'. Crie a pasta 'templates' na raiz do projeto e adicione o arquivo.`);
      }
      const templateBlob = await response.arrayBuffer();
      const zip = new PizZip(templateBlob);
      const doc = new docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: docxParser,
      });
      
      const context = {
        nome_cliente: clientName || 'Não informado',
        consultor: consultant || 'Não informado',
        data_orcamento: calculations.quoteDateStr,
        escopo_servico: 'Revisão Ortográfica e Gramatical',
        palavras: formatIntegerBRL(wordCount),
        preco_base: formatCurrencyBRL(calculations.basePrice),
        desconto_percent: calculations.effectiveDiscount ? `${discountPercentage.toFixed(1)}%` : "0%",
        valor_desconto: formatCurrencyBRL(calculations.discountAmount),
        preco_final: formatCurrencyBRL(calculations.finalPrice),
        num_parcelas: installments,
        valor_parcela: formatCurrencyBRL(calculations.installmentValue),
        prazo_dias: deliveryDays,
        data_entrega: calculations.deliveryDateStr,
        observacoes: observations || 'Nenhuma.',
      };
      
      doc.render(context);

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      
      const filename = `Orcamento_Revisao_${clientName.replace(/\s/g, '_') || 'Cliente'}_${new Date().toISOString().slice(0, 10)}.docx`;
      saveAs(out, filename);

    } catch (error: any) {
      console.error('Doc generation error:', error);
      
      let detailedMessage = 'Ocorreu um erro desconhecido ao gerar o documento.';
      if (error.properties && Array.isArray(error.properties.errors)) {
          const explanations = error.properties.errors.map((err: any) => {
              return err.properties?.explanation || JSON.stringify(err);
          }).join('; ');
          
          detailedMessage = `Erro no template: ${explanations}. Verifique os placeholders (ex: {{nome_cliente}}) no seu .docx.`;
      } else {
          detailedMessage = error.message || detailedMessage;
      }

      setDocxError(detailedMessage);
    } finally {
      setIsGeneratingDocx(false);
    }
  };


  return (
    <>
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-800 dark:text-primary-400">
          📝 Calculadora de Orçamento de Revisão
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Ferramenta moderna para agilizar suas cotações.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Dados e Cálculo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nome do cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Prof. João Silva" />
              <Input label="Consultor" value={consultant} onChange={(e) => setConsultant(e.target.value)} placeholder="Ex: Lucas Martins" />
              <Input label="Contagem de palavras" type="number" value={wordCount.toString()} onChange={(e) => setWordCount(Number(e.target.value))} min={0} step={100} />
              <Input label="Valor por palavra (R$)" type="number" value={pricePerWord.toString()} onChange={(e) => setPricePerWord(Number(e.target.value))} min={0} step={0.01} />
              <div className="md:col-span-2">
                <TextArea label="Observações (opcional)" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Ex: Valores válidos por 7 dias." />
              </div>
            </div>
          </Card>

          <Card title="Desconto e Parcelamento">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-start space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aplicar desconto?</label>
                 <Toggle checked={applyDiscount} onChange={setApplyDiscount} />
              </div>
              <Input label="% de desconto" type="number" value={discountPercentage.toString()} onChange={(e) => setDiscountPercentage(Number(e.target.value))} min={0} max={100} step={1} disabled={!applyDiscount} />
              <Input label="Nº de parcelas" type="number" value={installments.toString()} onChange={(e) => setInstallments(Number(e.target.value))} min={1} max={12} step={1} />
            </div>
          </Card>

          <Card title="Script de Venda (WhatsApp/CRM)">
            <div className="flex justify-end items-center mb-2 space-x-2">
              <button
                onClick={handleGenerateAiScript}
                disabled={isAiGenerating}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/70 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isAiGenerating ? (
                  'Gerando...'
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Melhorar com IA</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                aria-label="Copiar script"
              >
                {isCopied ? <ClipboardCheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
              </button>
            </div>
            <textarea
              readOnly
              value={isAiGenerating ? 'Aguarde, a IA está criando uma mensagem de vendas personalizada...' : salesScript}
              className="w-full h-64 p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-sm"
            />
             {aiError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">{aiError}</p>
              )}
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card title="Resultados do Orçamento" isSticky>
              <div className="grid grid-cols-1 gap-4 mb-6">
                  <Metric label="Preço Base" value={formatCurrencyBRL(calculations.basePrice)} />
                  <Metric label="Desconto" value={formatCurrencyBRL(calculations.discountAmount)} />
                  <Metric label="Preço Final" value={formatCurrencyBRL(calculations.finalPrice)} variant="highlight" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Data do Orçamento:</span>
                      <span className="font-semibold">{calculations.quoteDateStr}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Desconto Aplicado:</span>
                      <span className={`font-semibold ${calculations.effectiveDiscount ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {calculations.effectiveDiscount ? `${discountPercentage.toFixed(1)}%` : "Não"}
                      </span>
                  </div>
                  <div className="flex justify-between">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Parcelamento:</span>
                      <span className="font-semibold text-right">{calculations.installmentText}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Prazo Estimado:</span>
                      <span className="font-semibold">{deliveryDays} dias</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Entrega até:</span>
                      <span className="font-semibold">{calculations.deliveryDateStr}</span>
                  </div>
              </div>
          </Card>
           <Card title="Exportar">
              <div className="flex flex-col items-center space-y-4">
                  <button
                      onClick={generateDocx}
                      disabled={isGeneratingDocx}
                      className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait transition-colors"
                  >
                      {isGeneratingDocx ? 'Gerando...' : '📄 Gerar DOCX'}
                  </button>
                  {docxError && (
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{docxError}</p>
                  )}
              </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RevisionCalculator;
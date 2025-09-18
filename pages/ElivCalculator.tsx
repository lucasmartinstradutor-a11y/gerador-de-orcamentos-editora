import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/Card';
import { Input, TextArea, Select, Slider } from '../components/Input';
import { Metric } from '../components/Metric';
import { formatCurrencyBRL, formatIntegerBRL } from '../utils/formatters';
import { docxParser } from '../utils/docxtemplater-parser';
import { DocumentTextIcon, CheckCircleIcon, XCircleIcon, ClipboardIcon, ClipboardCheckIcon, SparklesIcon } from '../components/Icons';
import { ELIV_PACKAGES, ELIV_PAYMENT_OPTIONS, ELIV_DEFAULTS } from '../constants';
import { ElivPackageKey, ElivPaymentKey } from '../types';


const ElivCalculator: React.FC = () => {
    // --- State ---
    const [clientName, setClientName] = useState('');
    const [consultant, setConsultant] = useState('');
    const [projectName, setProjectName] = useState('');
    const [numPages, setNumPages] = useState(ELIV_DEFAULTS.NUM_PAGES);
    const [pkg, setPkg] = useState<ElivPackageKey>(ELIV_DEFAULTS.PKG as ElivPackageKey);
    const [paymentMethod, setPaymentMethod] = useState<ElivPaymentKey>(ELIV_DEFAULTS.PAYMENT_METHOD as ElivPaymentKey);
    const [additionalDiscount, setAdditionalDiscount] = useState(ELIV_DEFAULTS.ADDITIONAL_DISCOUNT);
    const [observations, setObservations] = useState('');
    
    const [salesScript, setSalesScript] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // --- Calculations ---
    const calculations = useMemo(() => {
        const selectedPackage = ELIV_PACKAGES[pkg];
        const selectedPayment = ELIV_PAYMENT_OPTIONS[paymentMethod];

        const subtotal = selectedPackage.price;

        const paymentDiscountAmount = subtotal * selectedPayment.discount;
        const priceAfterPaymentDiscount = subtotal - paymentDiscountAmount;
        
        const additionalDiscountAmount = priceAfterPaymentDiscount * (additionalDiscount / 100);
        const finalPrice = priceAfterPaymentDiscount - additionalDiscountAmount;

        const totalDiscountAmount = paymentDiscountAmount + additionalDiscountAmount;
        const effectiveDiscountPercent = subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

        const isInstallments = selectedPayment.installments > 1;
        const installmentValue = isInstallments ? finalPrice / selectedPayment.installments : finalPrice;
        
        const today = new Date();
        const quoteDateStr = today.toLocaleDateString('pt-BR');

        let paymentText = `À vista de ${formatCurrencyBRL(finalPrice)}`;
        if (isInstallments) {
            paymentText = `${selectedPayment.installments}x de ${formatCurrencyBRL(installmentValue)}`;
        }

        return {
            subtotal,
            totalDiscountAmount,
            finalPrice,
            isInstallments,
            numInstallments: selectedPayment.installments,
            installmentValue,
            paymentText,
            quoteDateStr,
            effectiveDiscountPercent,
        };
    }, [pkg, paymentMethod, additionalDiscount]);
    
    // --- Sales Script Generation ---
    useEffect(() => {
        const { finalPrice, paymentText, quoteDateStr, effectiveDiscountPercent, totalDiscountAmount } = calculations;
        const selectedPackage = ELIV_PACKAGES[pkg];

        const templateScript = `Olá, ${clientName || 'futuro autor'}! ✨ Segue a proposta para a publicação do seu livro "${projectName || 'seu projeto'}":

• Cliente: ${clientName || "-"}
• Consultor: ${consultant || "-"}
• Pacote: ${selectedPackage.name}
• Valor do Pacote: ${formatCurrencyBRL(selectedPackage.price)}
• Desconto Total: ${effectiveDiscountPercent.toFixed(1)}% (${formatCurrencyBRL(totalDiscountAmount)})
• Valor Final: ${formatCurrencyBRL(finalPrice)}
• Condição de Pagamento: ${paymentText}
• Data da Proposta: ${quoteDateStr}

Observações: ${observations || "-"}`.trim();

        setSalesScript(templateScript);
        setAiError(null);
    }, [clientName, consultant, projectName, pkg, observations, calculations]);


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
            const { finalPrice, paymentText, effectiveDiscountPercent, totalDiscountAmount } = calculations;
            
            const prompt = `
            Crie uma mensagem de vendas calorosa e profissional para ser enviada por WhatsApp a um autor que solicitou um orçamento de publicação.

            **Contexto:** Você é um consultor editorial da ELIV. O objetivo é apresentar o orçamento do pacote de publicação, reforçar os benefícios de publicar com a ELIV e guiar o autor para os próximos passos.

            **Use os seguintes dados para personalizar a mensagem:**
            - Nome do Cliente: ${clientName || "Caro(a) Autor(a)"}
            - Nome do Consultor: ${consultant || "Nosso consultor"}
            - Título do Projeto/Livro: ${projectName || "seu incrível livro"}
            - Pacote Escolhido: ${ELIV_PACKAGES[pkg].name}
            - Valor Final do Orçamento: ${formatCurrencyBRL(finalPrice)}
            - Condições de Pagamento: ${paymentText}
            - Desconto Total Aplicado: ${effectiveDiscountPercent.toFixed(1)}% (${formatCurrencyBRL(totalDiscountAmount)})
            - Observações Adicionais: ${observations || "Nenhuma"}

            **Requisitos para a mensagem:**
            1.  **Tom de Voz:** Inspirador, encorajador e profissional. O autor está prestes a realizar um sonho. Use emojis que reflitam essa jornada (livro 📖, foguete 🚀, brilho ✨).
            2.  **Estrutura:**
                a. Comece com uma saudação entusiasmada, mencionando o projeto do livro.
                b. Apresente o resumo do orçamento de forma clara e direta.
                c. Destaque o valor do pacote escolhido (mencione 1-2 itens chave do pacote, como "design de capa personalizado" ou "distribuição completa").
                d. Reforce a parceria da ELIV no sonho do autor.
                e. Termine com uma chamada para ação clara, convidando para uma conversa ou para formalizar o aceite ("Vamos dar o próximo passo para transformar seu manuscrito em realidade?", "Estou à disposição para tirar qualquer dúvida.").
            3.  **Clareza:** Seja transparente sobre valores e condições. Evite jargões complexos da indústria editorial.
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

    // --- DOCX Generation ---
    const generateDocx = async () => {
        setIsGenerating(true);
        setGenerationError(null);

        try {
            const PizZip = (window as any).PizZip;
            const docxtemplater = (window as any).docxtemplater;
            const saveAs = (window as any).saveAs;

            if (!PizZip || !docxtemplater || !saveAs) {
                throw new Error('Bibliotecas de geração de DOCX não estão carregadas.');
            }

            const response = await fetch('/templates/modelo_eliv.docx');
            if (!response.ok) {
                throw new Error("Modelo 'modelo_eliv.docx' não encontrado. Crie-o na pasta /public/templates.");
            }
            const templateBlob = await response.arrayBuffer();
            const zip = new PizZip(templateBlob);
            const doc = new docxtemplater(zip, { paragraphLoop: true, linebreaks: true, parser: docxParser });
            
            const packageDetailsForDocx = ELIV_PACKAGES[pkg].details.map(item => ({
                name: item.name,
                status_text: item.included ? 'Incluso' : 'Não Incluso',
            }));

            let paymentConditionText = `À vista (PIX) no valor de ${formatCurrencyBRL(calculations.finalPrice)}`;
            if (calculations.isInstallments) {
                paymentConditionText = `Parcelado em ${calculations.numInstallments}x de ${formatCurrencyBRL(calculations.installmentValue)}`;
            }

            const discountPercentText = `${calculations.effectiveDiscountPercent.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;


            const context = {
                nome_cliente: clientName || 'Não informado',
                consultor: consultant || 'Não informado',
                nome_projeto: projectName || 'Não informado',
                data_orcamento: calculations.quoteDateStr,
                pkg: ELIV_PACKAGES[pkg].name,
                num_paginas: formatIntegerBRL(numPages),
                
                preco_base: formatCurrencyBRL(calculations.subtotal),
                desconto_percent: discountPercentText,
                valor_desconto: formatCurrencyBRL(calculations.totalDiscountAmount),
                preco_final: formatCurrencyBRL(calculations.finalPrice),
                
                condicao_pagamento: paymentConditionText,
                package_details: packageDetailsForDocx,
                observacoes: observations || 'Nenhuma.',
            };
            
            doc.render(context);

            const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const filename = `Orcamento_ELIV_${projectName.replace(/\s/g, '_') || 'Projeto'}_${new Date().toISOString().slice(0, 10)}.docx`;
            saveAs(out, filename);

        } catch (error: any) {
            console.error('Doc generation error:', error);
            let detailedMessage = error.message || 'Ocorreu um erro desconhecido.';
             if (error.properties && Array.isArray(error.properties.errors)) {
                const explanations = error.properties.errors.map((err: any) => err.properties?.explanation || JSON.stringify(err)).join('; ');
                detailedMessage = `Erro no template: ${explanations}. Verifique os placeholders (ex: {{nome_cliente}}) no seu .docx.`;
            }
            setGenerationError(detailedMessage);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
     <>
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-800 dark:text-primary-400">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-500">
            Orçamentos ELIV
          </span>
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Crie orçamentos de publicação de forma rápida e profissional.
        </p>
      </header>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card title="Dados do Projeto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Nome do cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Ana Carolina" />
                    <Input label="Consultor" value={consultant} onChange={(e) => setConsultant(e.target.value)} placeholder="Ex: Lucas Martins" />
                    <div className="md:col-span-2">
                        <Input label="Título do Projeto/Livro" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ex: A Jornada do Escritor" />
                    </div>
                </div>
            </Card>

            <Card title="Pacote e Detalhes do Livro">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Pacote de Publicação" value={pkg} onChange={(e) => setPkg(e.target.value as ElivPackageKey)}>
                        {Object.entries(ELIV_PACKAGES).map(([key, value]) => (
                            <option key={key} value={key}>{value.name}</option>
                        ))}
                    </Select>
                     <Input label="Número de Páginas (aprox.)" type="number" value={String(numPages)} onChange={(e) => setNumPages(Number(e.target.value))} min={10} step={10} placeholder="Ex: 150" />
                </div>
            </Card>

            <Card title="Pagamento e Observações">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Condição de Pagamento" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as ElivPaymentKey)}>
                        {Object.entries(ELIV_PAYMENT_OPTIONS).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </Select>
                 </div>
                 <div className="mt-6">
                     <TextArea label="Observações (opcional)" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Ex: Cronograma de entregas a ser definido em reunião." />
                 </div>
            </Card>

            <Card title="Desconto Adicional">
                <Slider
                    label="Desconto extra"
                    value={additionalDiscount}
                    onChange={(e) => setAdditionalDiscount(Number(e.target.value))}
                    min="0"
                    max="20"
                    step="0.5"
                    valueLabel={`${additionalDiscount.toFixed(1)}%`}
                />
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
                    value={isAiGenerating ? 'Aguarde, a IA está criando uma mensagem inspiradora para o autor...' : salesScript}
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
                    <Metric label="Preço do Pacote" value={formatCurrencyBRL(calculations.subtotal)} />
                    <Metric label="Desconto Total" value={formatCurrencyBRL(calculations.totalDiscountAmount)} />
                    <Metric label="Preço Final" value={formatCurrencyBRL(calculations.finalPrice)} variant="highlight" />
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Pacote:</span>
                        <span className="font-semibold">{ELIV_PACKAGES[pkg].name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Pagamento:</span>
                        <span className="font-semibold text-right">{calculations.paymentText}</span>
                    </div>
                </div>
                 <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                     <h3 className="font-bold text-base text-primary-900 dark:text-primary-300 mb-2">Detalhes do Pacote</h3>
                     <ul className="space-y-2 text-sm">
                        {ELIV_PACKAGES[pkg].details.map(item => (
                            <li key={item.name} className="flex items-center">
                                {item.included ? <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" /> : <XCircleIcon className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />}
                                <span className={item.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>{item.name}</span>
                            </li>
                        ))}
                     </ul>
                 </div>
            </Card>
             <Card title="Exportar Orçamento">
              <div className="flex flex-col items-center space-y-4">
                  <button
                      onClick={generateDocx}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait transition-colors"
                  >
                      <DocumentTextIcon className="w-5 h-5" />
                      {isGenerating ? 'Gerando...' : 'Gerar Orçamento DOCX'}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Certifique-se de que o arquivo <strong>modelo_eliv.docx</strong> existe na pasta <strong>/public/templates</strong>.
                  </p>
                  {generationError && (
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{generationError}</p>
                  )}
              </div>
          </Card>
        </div>
      </div>
    </>
    );
};

export default ElivCalculator;
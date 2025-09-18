import { ElivPackageKey, ElivPaymentKey } from './types';

// --- RevisionCalculator Constants ---
export const REVISION_DEFAULTS = {
  WORD_COUNT: 30000,
  PRICE_PER_WORD: 0.03,
  APPLY_DISCOUNT: true,
  DISCOUNT_PERCENTAGE: 20,
  INSTALLMENTS: 4,
  DELIVERY_DAYS: 30,
};

// --- ElivCalculator Constants ---
export const ELIV_PACKAGES = {
  basico: {
    name: 'Pacote Básico',
    price: 2094, // 6 * 349
    details: [
      { name: 'Todos os marketplaces credenciados', included: true },
      { name: 'Desconto progressivo para compra pelo autor', included: true },
      { name: 'Maior porcentagem de direito autoral: 50% do L.L.', included: true },
      { name: 'Não exige quantidade mínima', included: true },
      { name: 'Diagramação de todas as páginas', included: true },
      { name: 'Design personalizado da capa', included: true },
      { name: 'Opção por papel offset branco ou pólen amarelado', included: true },
      { name: 'Capa padrão (flexível)', included: true },
      { name: 'Livro físico', included: true },
      { name: 'Opção por publicar em capa dura', included: false },
      { name: 'E-book', included: false },
      { name: 'Convite de lançamento personalizado', included: false },
      { name: 'Post personalizado para as mídias sociais', included: false },
      { name: 'Audiobook (com voz artificial realista)', included: false },
    ],
  },
  especial: {
    name: 'Pacote Especial',
    price: 2154, // 6 * 359
    details: [
        { name: 'Todos os marketplaces credenciados', included: true },
        { name: 'Desconto progressivo para compra pelo autor', included: true },
        { name: 'Maior porcentagem de direito autoral: 50% do L.L.', included: true },
        { name: 'Não exige quantidade mínima', included: true },
        { name: 'Diagramação de todas as páginas', included: true },
        { name: 'Design personalizado da capa', included: true },
        { name: 'Opção por papel offset branco ou pólen amarelado', included: true },
        { name: 'Capa padrão (flexível)', included: true },
        { name: 'Livro físico', included: true },
        { name: 'Opção por publicar em capa dura', included: true },
        { name: 'E-book', included: true },
        { name: 'Convite de lançamento personalizado', included: true },
        { name: 'Post personalizado para as mídias sociais', included: false },
        { name: 'Audiobook (com voz artificial realista)', included: false },
    ],
  },
  premium: {
    name: 'Pacote Premium',
    price: 2994, // 6 * 499
    details: [
        { name: 'Todos os marketplaces credenciados', included: true },
        { name: 'Desconto progressivo para compra pelo autor', included: true },
        { name: 'Maior porcentagem de direito autoral: 50% do L.L.', included: true },
        { name: 'Não exige quantidade mínima', included: true },
        { name: 'Diagramação de todas as páginas', included: true },
        { name: 'Design personalizado da capa', included: true },
        { name: 'Opção por papel offset branco ou pólen amarelado', included: true },
        { name: 'Capa padrão (flexível)', included: true },
        { name: 'Livro físico', included: true },
        { name: 'Opção por publicar em capa dura', included: true },
        { name: 'E-book', included: true },
        { name: 'Convite de lançamento personalizado', included: true },
        { name: 'Post personalizado para as mídias sociais', included: true },
        { name: 'Audiobook (com voz artificial realista)', included: true },
    ],
  },
};

export const ELIV_PAYMENT_OPTIONS = {
    'pix': { label: 'À vista (PIX)', installments: 1, discount: 0 },
    '6x': { label: '6x no Cartão de Crédito', installments: 6, discount: 0 },
};

export const ELIV_DEFAULTS = {
    NUM_PAGES: 150,
    PKG: 'especial' as ElivPackageKey,
    PAYMENT_METHOD: '6x' as ElivPaymentKey,
    ADDITIONAL_DISCOUNT: 0,
};

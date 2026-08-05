import { EvaluationItem } from '../types';

export const EVALUATION_ITEMS: EvaluationItem[] = [
  {
    id: 1,
    description: 'Descreve a trajetória de formação inicial e pós-graduações.',
    block: 'formacao_academica',
    options: {
      A: { label: 'Atende plenamente', score: 1.0 },
      B: { label: 'Atende parcialmente', score: 0.5 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 2,
    description: 'Organiza os fatos cronologicamente e justifica a relevância destes para o exercício profissional.',
    block: 'formacao_academica',
    options: {
      A: { label: 'Atende plenamente', score: 1.0 },
      B: { label: 'Atende parcialmente', score: 0.5 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 3,
    description: 'Descreve a trajetória profissional.',
    block: 'trajetoria_profissional',
    options: {
      A: { label: 'Atende plenamente', score: 1.0 },
      B: { label: 'Atende parcialmente', score: 0.5 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 4,
    description: 'Organiza os fatos cronologicamente.',
    block: 'trajetoria_profissional',
    options: {
      A: { label: 'Atende plenamente', score: 1.0 },
      B: { label: 'Atende parcialmente', score: 0.5 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 5,
    description: 'Descreve o impacto do processo formativo dessa pós-graduação em sua prática profissional.',
    block: 'trajetoria_profissional',
    options: {
      A: { label: 'Atende plenamente', score: 1.5 },
      B: { label: 'Atende parcialmente', score: 0.7 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 6,
    description: 'Aponta os planos futuros.',
    block: 'consideracoes_reflexivas',
    options: {
      A: { label: 'Atende plenamente', score: 1.0 },
      B: { label: 'Atende parcialmente', score: 0.5 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 7,
    description: 'Atende as normas da ABNT quanto a: Identificação, introdução, seções, numeração de páginas, margens, fonte, espaçamento.',
    block: 'normas_abnt',
    options: {
      A: { label: 'Atende plenamente', score: 1.0 },
      B: { label: 'Atende parcialmente', score: 0.5 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 8,
    description: 'Apresenta adequada formatação dos títulos.',
    block: 'normas_abnt',
    options: {
      A: { label: 'Atende plenamente', score: 0.5 },
      B: { label: 'Atende parcialmente', score: 0.3 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 9,
    description: 'Faz citação adequada dos autores.',
    block: 'normas_abnt',
    options: {
      A: { label: 'Atende plenamente', score: 0.5 },
      B: { label: 'Atende parcialmente', score: 0.3 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 10,
    description: 'Conecta os parágrafos adequadamente.',
    block: 'linguagem_academica',
    options: {
      A: { label: 'Atende plenamente', score: 0.5 },
      B: { label: 'Atende parcialmente', score: 0.3 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 11,
    description: 'Utiliza linguagem apropriada para o espaço acadêmico.',
    block: 'linguagem_academica',
    options: {
      A: { label: 'Atende plenamente', score: 0.5 },
      B: { label: 'Atende parcialmente', score: 0.3 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
  {
    id: 12,
    description: 'Observa normas ortográficas adequadamente.',
    block: 'linguagem_academica',
    options: {
      A: { label: 'Atende plenamente', score: 0.5 },
      B: { label: 'Atende parcialmente', score: 0.3 },
      C: { label: 'Não atende', score: 0.0 },
    },
  },
];

export const BLOCK_DESCRIPTIONS = [
  'Itens 1 e 2: referentes à formação acadêmica (valor por item: 1,0)',
  'Itens 3 ao 5: referentes à trajetória profissional (valor por item: 1,0 para itens 3 e 4; 1,5 para item 5)',
  'Item 6: referentes à considerações reflexivas (valor do item: 1,0)',
  'Itens 7 ao 9: referentes às normas da ABNT (valor por item: 1,0 para item 7; 0,5 para itens 8 e 9)',
  'Itens 10 ao 12: referentes à linguagem acadêmica (valor por item: 0,5)',
];

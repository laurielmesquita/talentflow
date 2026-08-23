import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PDFViewer from '@/components/PDFViewer';

describe('PDFViewer Component', () => {
  it('renders the document toolbar when pdfUrl is provided', () => {
    render(
      <PDFViewer 
        pdfUrl="https://res.cloudinary.com/demo/raw/upload/v1/curriculo_lauriel.pdf" 
        candidateName="Lauriel Mesquita" 
      />
    );

    expect(screen.getByText(/Documento Original/i)).toBeDefined();
    expect(screen.getByText(/Lauriel Mesquita.pdf/i)).toBeDefined();
    expect(screen.getByTitle(/Recarregar visualizador/i)).toBeDefined();
    expect(screen.getByTitle(/Abrir em nova guia \(blob\)/i)).toBeDefined();
  });

  it('renders informative fallback state when pdfUrl is null', () => {
    render(
      <PDFViewer 
        pdfUrl={null} 
        candidateName="Candidato Sem CV" 
      />
    );

    expect(screen.getByText(/Arquivo PDF Não Encontrado/i)).toBeDefined();
    expect(screen.getByText(/Candidato Sem CV/i)).toBeDefined();
  });
});

// src/components/orders/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as PaginationType } from '../../types/order.types';
import '../../styles/Pagination.css';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {/* Versión móvil */}
      <div className="pagination__mobile">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="pagination__button"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="pagination__button"
        >
          Siguiente
        </button>
      </div>

      {/* Versión desktop */}
      <div className="pagination__desktop">
        <div className="pagination__info">
          <p className="pagination__text">
            Mostrando <span className="pagination__highlight">{((page - 1) * limit) + 1}</span> a{' '}
            <span className="pagination__highlight">{Math.min(page * limit, total)}</span> de{' '}
            <span className="pagination__highlight">{total}</span> resultados
          </p>
        </div>
        <nav className="pagination__nav">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="pagination__nav-button pagination__nav-button--prev"
          >
            <ChevronLeft className="pagination__icon" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`pagination__page ${
                    page === pageNum ? 'pagination__page--active' : ''
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === page - 2 || pageNum === page + 2) {
              return (
                <span key={pageNum} className="pagination__ellipsis">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="pagination__nav-button pagination__nav-button--next"
          >
            <ChevronRight className="pagination__icon" />
          </button>
        </nav>
      </div>
    </div>
  );
};
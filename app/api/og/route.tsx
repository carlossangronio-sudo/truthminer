import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les paramètres de l'URL
    const title = searchParams.get('title') || 'TruthMiner - Analyse Reddit';
    const description = searchParams.get('description') || 'Découvrez la vérité brute sur les produits';
    const imageUrl = searchParams.get('image') || null;

    // Style de magazine d'investigation / tableau de bord de données
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Grille de fond subtile (style tableau de bord) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Contenu principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              padding: '60px',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            {/* Colonne gauche : Image du produit (si disponible) */}
            {imageUrl && (
              <div
                style={{
                  display: 'flex',
                  width: '400px',
                  height: '510px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.1)',
                  backgroundColor: '#1a1a1a',
                  flexShrink: 0,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}

            {/* Colonne droite : Texte */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: '24px',
                justifyContent: 'center',
              }}
            >
              {/* Badge TruthMiner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  TruthMiner
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Analyse Reddit
                </div>
              </div>

              {/* Titre principal */}
              <h1
                style={{
                  fontSize: imageUrl ? '56px' : '72px',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                }}
              >
                {title}
              </h1>

              {/* Description */}
              <p
                style={{
                  fontSize: '24px',
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0,
                  maxWidth: imageUrl ? '600px' : '900px',
                }}
              >
                {description.length > 120 ? `${description.substring(0, 120)}...` : description}
              </p>

              {/* Ligne de séparation décorative */}
              <div
                style={{
                  width: '80px',
                  height: '4px',
                  backgroundColor: '#2563eb',
                  marginTop: '8px',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>

          {/* Footer avec URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '16px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>tminer.io</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('[OG Image] Erreur lors de la génération:', error);
    // Retourner une image d'erreur simple
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            fontSize: '32px',
          }}
        >
          TruthMiner
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}


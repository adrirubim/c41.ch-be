import { cn } from '#app/lib/utils';
import type { CSSProperties } from 'react';

type SrcSet = string;

export interface AppImageProps {
    alt: string;
    /** Fallback src for very old browsers (jpg/png). */
    src: string;
    /** WebP srcset, e.g. "url 400w, url 1200w". */
    webpSrcSet?: SrcSet;
    /** Fallback srcset, e.g. "url 400w, url 1200w". */
    srcSet?: SrcSet;
    sizes?: string;
    width?: number;
    height?: number;
    /** If width/height are not known, provide ratio like 16/9. */
    aspectRatio?: number;
    className?: string;
    imgClassName?: string;
    style?: CSSProperties;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
}

export function AppImage({
    alt,
    src,
    webpSrcSet,
    srcSet,
    sizes,
    width,
    height,
    aspectRatio,
    className,
    imgClassName,
    style,
    loading = 'lazy',
    decoding = 'async',
}: AppImageProps) {
    const ratio =
        typeof aspectRatio === 'number' && aspectRatio > 0
            ? aspectRatio
            : typeof width === 'number' && typeof height === 'number' && height > 0
              ? width / height
              : null;

    const paddingBottom =
        ratio !== null ? `${(1 / ratio) * 100}%` : undefined;

    return (
        <div
            className={cn('relative overflow-hidden', className)}
            style={{
                ...style,
            }}
        >
            {paddingBottom !== undefined ? (
                <div aria-hidden="true" style={{ paddingBottom }} />
            ) : null}

            <picture>
                {typeof webpSrcSet === 'string' && webpSrcSet.trim() !== '' ? (
                    <source
                        type="image/webp"
                        srcSet={webpSrcSet}
                        sizes={sizes}
                    />
                ) : null}
                <img
                    alt={alt}
                    src={src}
                    srcSet={srcSet}
                    sizes={sizes}
                    width={width}
                    height={height}
                    loading={loading}
                    decoding={decoding}
                    className={cn(
                        paddingBottom !== undefined
                            ? 'absolute inset-0 h-full w-full object-cover'
                            : 'h-auto w-full object-cover',
                        imgClassName,
                    )}
                />
            </picture>
        </div>
    );
}


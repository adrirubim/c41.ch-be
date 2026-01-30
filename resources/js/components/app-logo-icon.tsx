import type { ImgHTMLAttributes } from 'react';

type LogoProps = Pick<
    ImgHTMLAttributes<HTMLImageElement>,
    'className' | 'style'
>;

export default function AppLogoIcon({ className, style }: LogoProps) {
    const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`;

    return (
        <img
            src={logoSrc}
            alt="C41.ch Blog Logo"
            className={className}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                ...(style && typeof style === 'object' && !Array.isArray(style)
                    ? style
                    : {}),
            }}
        />
    );
}

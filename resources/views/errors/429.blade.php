<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>429 · Too Many Requests · C41.ch Blog</title>
        <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
        <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @vite(['resources/css/app.css'])
    </head>
    <body class="flex h-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <div class="mx-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl shadow-black/60 backdrop-blur">
            <div class="mb-6 text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    C41.ch Blog
                </p>
                <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
                    Too many requests
                </h1>
                <p class="mt-3 text-sm text-slate-300">
                    You have made too many attempts in a short period. For security,
                    we have temporarily paused this flow.
                </p>
            </div>

            <div class="mb-6 flex items-center justify-center gap-4">
                <span class="text-5xl font-bold tabular-nums text-slate-400">429</span>
                <div class="h-10 w-px bg-gradient-to-b from-slate-600 via-slate-500 to-slate-600"></div>
                <div class="space-y-1 text-left text-sm text-slate-300">
                    <p>Please wait a few seconds and try again.</p>
                    <p class="text-xs text-slate-400">
                        If you do not remember your password, you can use the
                        <span class="font-medium text-slate-200">“Forgot password?”</span> link.
                    </p>
                </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-50 shadow-sm transition hover:border-slate-400 hover:bg-slate-900"
                    onclick="window.history.back()"
                >
                    Go back to previous attempt
                </button>
                <a
                    href="{{ url('/') }}"
                    class="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-sky-950 shadow-sm transition hover:bg-sky-400"
                >
                    Go to homepage
                </a>
            </div>
        </div>
    </body>
</html>


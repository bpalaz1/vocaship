import React from "react";

export interface BionicFormatOptions {
  theme?: "dark" | "sepia" | "light";
  strongClassName?: string;
  restClassName?: string;
}

/**
 * Biyonik Okuma (Bionic Reading) Dönüştürücüsü
 * Metindeki kelimeleri parçalayıp ilk 1-3 harfini (yaklaşık %40'ını) kalınlaştırarak
 * gözün metin üzerinde daha hızlı atlamasını ve odaklanmasını sağlar.
 * Noktalama işaretlerini korur.
 */
export function formatBionicWord(
  word: string,
  options: BionicFormatOptions = {}
): React.ReactElement {
  if (!word || word.trim().length === 0) {
    return <span>{word}</span>;
  }

  // Noktalama işaretleri ile kelime kökünü ayır (Uluslararası karakterler ve kesme/tire desteği)
  const match = word.match(/^([^a-zA-Z0-9\u00C0-\u024F]*)([a-zA-Z0-9\u00C0-\u024F'-]+)([^a-zA-Z0-9\u00C0-\u024F]*)$/);

  if (!match) {
    return <span>{word}</span>;
  }

  const prefix = match[1];
  const core = match[2];
  const suffix = match[3];

  // Kelime uzunluğuna göre kalınlaştırılacak harf sayısı
  const midPoint = core.length <= 3 ? 1 : Math.ceil(core.length * 0.4);
  const boldPart = core.slice(0, midPoint);
  const restPart = core.slice(midPoint);

  // Temaya duyarlı stil belirleme
  let strongClass = "font-black text-inherit tracking-tight";
  let restClass = "font-normal opacity-85 text-inherit";

  if (options.strongClassName) strongClass = options.strongClassName;
  if (options.restClassName) restClass = options.restClassName;

  return (
    <span className="inline-block select-text">
      {prefix && <span className="opacity-75">{prefix}</span>}
      <strong className={strongClass}>{boldPart}</strong>
      <span className={restClass}>{restPart}</span>
      {suffix && <span className="opacity-75">{suffix}</span>}
    </span>
  );
}

/**
 * Tüm metni veya cümleyi biyonik kelimeler dizisine dönüştürür
 */
export function convertTextToBionic(
  text: string,
  options: BionicFormatOptions = {}
): React.ReactElement[] {
  if (!text) return [];
  const tokens = text.split(/(\s+)/);

  return tokens.map((token, i) => {
    if (/^\s+$/.test(token)) {
      return <React.Fragment key={i}>{token}</React.Fragment>;
    }
    return (
      <React.Fragment key={i}>
        {formatBionicWord(token, options)}
      </React.Fragment>
    );
  });
}

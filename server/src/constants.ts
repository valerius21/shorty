const __dbPassword__ = "postgres";
const __dbUser__ = "postgres";
const __dbName__ = "shorty"; // needs to be created
const __prod__ = false;
const __port__ = __prod__ ? 443 : 5000;
const __idLength__ = 10; // https://zelark.github.io/nano-id-cc/
const __hostname__ = __prod__ ? "easy.xyz" : "localhost";

export {
  __dbPassword__,
  __dbUser__,
  __dbName__,
  __prod__,
  __idLength__,
  __port__,
  __hostname__,
};

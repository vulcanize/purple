{}:
let pkgs = (import ./project.nix {}).pkgs;
in with pkgs.haskellPackages; shellFor {
  withHoogle = true;
  packages = p: [ p.mkrfuzz ];
  nativeBuildInputs = [ cabal-install ghcid hlint hoogle ];
}

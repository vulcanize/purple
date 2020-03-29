{}:
let project = (import ./project.nix {});
in with project; pkgs.haskellPackages.shellFor {
  withHoogle = true;
  packages = p: [ packages.mkrfuzz ];
  nativeBuildInputs = with pkgs.haskellPackages; [ cabal-install ghcid hlint hoogle ];
}

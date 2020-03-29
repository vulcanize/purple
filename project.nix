{ compiler ? "ghc865" }:
let
  hostNixpkgs = import <nixpkgs> {};

  sources = {
    pinnedNixpkgs = builtins.fetchTarball {
      name = "release-19.09";
      url = https://github.com/nixos/nixpkgs/archive/64a3ccb852d4f34abb015503affd845ef03cc0d9.tar.gz;
      sha256 = "0jigsyxlwl5hmsls4bqib0rva41biki6mwnswgmigwq41v6q7k94";
    };

    dapptools = hostNixpkgs.fetchFromGitHub {
      owner = "dapphub";
      repo = "dapptools";
      rev = "af84e2ee0a0654fdaa91186384233cf1731ee7ce";
      sha256 = "1zqqwbhpk1idi4x0lcgcpfxxcfpiyq9bgbgwfsk7yzkk6q3j1z6k";
      fetchSubmodules = true;
    };

    gitignore = hostNixpkgs.fetchFromGitHub {
      owner = "hercules-ci";
      repo = "gitignore";
      rev = "f9e996052b5af4032fe6150bba4a6fe4f7b9d698";
      sha256 = "0jrh5ghisaqdd0vldbywags20m2cxpkbbk5jjjmwaw0gr8nhsafv";
    };

    mkrfuzz = gitignoreSource ./.;
  };

  gitignoreSource = (import sources.gitignore {}).gitignoreSource;

  overlay = self: super: {
    haskellPackages =
      super.haskell.packages.${compiler}.override (old: {
        overrides = self.lib.composeExtensions (old.overrides or (_: _: {}))
          (self: super: {
            brick = self.callHackageDirect {
              pkg = "brick";
              ver = "0.46";
              sha256 = "1d08qsgz7i3ndfknc5nx9kvzjl1pm7is2cwi6i6h1gd4shdhz5yy";
            } {};

            mkrfuzz = self.callCabal2nix "mkrfuzz" sources.mkrfuzz {};
          });
      });
  };

  overlays = [
    (import (sources.dapptools + /overlay.nix))
    overlay
  ];

  pkgs = import sources.pinnedNixpkgs { inherit overlays; };

in {
  inherit pkgs overlays;
}

{ compiler ? "ghc865" }:
let
  hostNixpkgs = import <nixpkgs> {};

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
          });
      });
  };

  pkgs = import pinnedNixpkgs {
    overlays = [
      overlay
      (import (dapptools + /overlay.nix))
    ];
  };

  mkrfuzz = pkgs.haskellPackages.callCabal2nix "mkrfuzz" ./. {};

in {
  inherit pkgs;
  packages = {
    inherit mkrfuzz;
  };
}

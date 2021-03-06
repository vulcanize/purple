let $ = React.createElement
let dec = s => new Decimal(s)
let unray = x => x.toFixed(36)
let unwad = x => x.toFixed(18)

// let yearSecs = dec("3.154e7")
let yearSecs = dec("1")
let wayYearPps = way => way.pow(yearSecs).sub(1).mul(dec(100))
let showWay = way => `${wayYearPps(way).toFixed(5)} pp/sec`
let showHow = how => `${showWay(how)}²`
let showTax = tax => `${showWay(tax)}`

let showPercentage = x => `${x.mul(100)}%`

let valueExplanations = {
  par: "target price of dai",
  wut: "market price of dai",
  way: "current rate of target price change",
  how: "magnitude of target price acceleration",
  tau: "time stamp of feedback engine update",
  lad: "owner of urn",
  gem: "ID of token",
  wad: "token quantity",
  ilk: "ID of ilk",
  axe: "penalty ratio on riddance",
  hat: "issuance ceiling for ilk",
  lax: "duration of acceptable price feed limbo",
  mat: "minimum ratio of assets per dai issuance",
  chi: "current value of fee unit",
  rho: "timestamp of fee unit adjustment",
  rum: "total ilk issuance",
  tag: "latest market price",
  zzz: "feed-defined market price expiration time",
}

let transform = ({
  era,
  balances,
  vox: { way, par, wut, how, tau },
  tags, ilks, urns,
}) => ({
  era: dec(era),
  balances: balances.map(([[lad, gem], wad]) => [
    [lad, gem], dec(wad)
  ]),
  vox: {
    way: dec(way),
    par: dec(par),
    wut: dec(wut),
    how: dec(how),
    tau: dec(tau),
  },
  tags: tags.map(([id, {
    tag, zzz
  }]) => [id, {
    tag: dec(tag),
    zzz: dec(zzz),
  }]),
  ilks: ilks.map(([id, {
    gem, axe, hat, lax, mat, tax, chi, rho, rum
  }]) => [id, {
    gem,
    axe: dec(axe),
    hat: dec(hat),
    lax: dec(lax),
    mat: dec(mat),
    tax: dec(tax),
    chi: dec(chi),
    rho: dec(rho),
    rum: dec(rum),
  }]),
  urns: urns.map(([id, {
    lad, ilk, art, ink, cat
  }]) => [id, {
    lad: lad,
    ilk,
    art: dec(art),
    ink: dec(ink),
    cat,
  }]),
})

let getUrn = (system, id) => system.urns.find(x => x[0] == id)[1]
let getIlk = (system, id) => system.ilks.find(x => x[0] == id)[1]
let urnIlk = (system, id) => getIlk(system, getUrn(system, id).ilk)

// let showValue = (struct, name, id, system) => ({
//   par: x => `${x.toString()} SDR`,
//   wut: x => `${x.toString()} SDR`,
//   way: x => showWay(x),
//   how: x => showHow(x),
//   tau: x => `t = ${tau.toString()}`,
//   gem: x => renderGemId({
//     ilks: () => x.gem,
//     urns: () => urnIlk(system, id),
//     tags: () => id,
//     wads: () => x[1].contents || x[1].tag
//   }[struct]())
// })[name]

let renderSystem = (previousSystem, {
  balances,
  vox: { way, par, wut, how, tau },
  tags, ilks, urns,
}) => $("div", null, [
  ...renderTable(
    "vox",
    [null],
    "par wut way how tau".split(" "),
    _ => [
      $("td", null, `${par.toString()} SDR`),
      $("td", null, `${wut.toString()} SDR`),
      $("td", null, showWay(way)),
      $("td", null, showHow(how)),
      $("td", null, `t = ${tau.toString()}`),
    ]
  ),
  ...renderTable(
    "ilks",
    ilks,
    "ilk gem mat hat tax axe lax rum chi rho".split(" "),
    ([id, ilk]) => [
      $("td", null, id),
      $("td", null, renderGemId(ilk.gem)),
      $("td", null, showPercentage(ilk.mat)),
      $("td", null, `${ilk.hat} dai`),
      $("td", null, showTax(ilk.tax)),
      $("td", null, showPercentage(ilk.axe)),
      $("td", null, `${ilk.lax} sec`),
      $("td", null, `${ilk.rum.toFixed(5)} chi`),
      $("td", null, `${ilk.chi} dai`),
      $("td", null, `at ${ilk.rho}s`),
    ]
  ),
  ...renderTable("urns", urns, "urn lad ilk ink art cat".split(" "), ([id, urn]) => [
    $("td", null, id),
    $("td", null, urn.lad),
    $("td", null, urn.ilk.toString()),
    $("td", null, `${urn.ink} ${renderGemId(urnIlk({ urns, ilks }, id).gem)}`),
    $("td", null, `${urn.art.toFixed(5)} chi`),
    $("td", null, urn.cat || "n/a"),
  ]),
  ...renderTable("tags", tags, ["gem", "tag", "zzz"], ([id, { tag, zzz }]) => [
    $("td", null, [renderGemId(id)]),
    $("td", null, `${tag} SDR`),
    $("td", null, `${zzz} sec`),
  ]),
  ...renderTable("wads", balances, ["lad", "gem", "wad"], x => [
    $("td", {
      className: x[0][0].contents ? null : "special"
    }, x[0][0].contents || x[0][0].tag),
    $("td", null, x[0][1].contents || x[0][1].tag),
    $("td", null, x[1].toString()),
  ]),
])

let renderGemId = id => id

let renderTable = (title, xs, ths, f) => !xs.length ? [] : [
  $("div", { className: "box" }, [
    $("table", null, [
      $("thead", null, [
        $("tr", null, [
          $("th", null, title),
          ...ths.map(s => $("th", { title: valueExplanations[s] }, s))
        ])
      ]),
      $("tbody", null, xs.map(x => $("tr", null, [
        $("td", null, ""),
        ...f(x)
      ])))
    ])
  ])
]

let render = ({
  saga,
}) => {
  let era
  let previousSystem
  return $("ol", null, [
    saga.map(([act, system]) =>
      $("li", null, [
        $("details", null, [
          $("summary", null, [
            era === system.era.toString() ? null : (era = system.era.toString(), $("date", null, `(t = ${system.era}) `)),
            explainAct(act, system)
          ]),
          renderAct(act),
          renderSystem(previousSystem, previousSystem = system),
        ])
      ])
    )
  ])
}

let opts = args =>
  Object.keys(args).map(k => `--${k}/${args[k]}`).join("/")

let explainAct = (act, system) => {
  let parts = act.split("/")
  let verb = parts[0]
  let arg = s => parts[parts.indexOf(`--${s}`) + 1]
  let cases = {
    init: () => `Initialize the system.`,
    frob: () => `Set sensitivity to ${showHow(dec(arg("how")))}.`,
    mint: () => `${arg("lad")}: Mint ${arg("wad")} ${arg("gem")}.`,
    form: () => `Form ilk ${arg("ilk")} with gem ${arg("gem")}.`,
    cork: () => `Set hat of ilk ${arg("ilk")} to ${arg("hat")} dai.`,
    mark: () =>
      `Mark gem ${arg("gem")} with price ${arg("tag")} SDR, valid ${arg("zzz")}s.`,
    open: () =>
      `${arg("lad")}: Open urn of type ${arg("ilk")} named "${arg("urn")}".`,
    lock: () =>
      `${getUrn(system, arg("urn")).lad}: Lock ${arg("wad")} ${renderGemId(urnIlk(system, arg("urn")).gem)} in urn "${arg("urn")}".`,
    draw: () =>
      `${getUrn(system, arg("urn")).lad}: Draw ${arg("dai")} dai from urn "${arg("urn")}".`,
  }
  return cases[verb] ? cases[verb]() : ""
}

let renderAct = act => {
  let parts = act.split("/")
  return $("span", { className: "act" }, [
    "$ ",
    $("span", null, parts[0]),
    ...(parts.slice(1).map(
      x => $(
        "span", { className: x.startsWith("--") ? "param" : null },
        x.replace(/^--/, "")
      )
    ))
  ])
}

let post = (path, body) =>
  fetch(`/${path}`, {
    method: "POST", body: body ? JSON.stringify(body) : null,
  }).then(x => x.json())

let act = (verb, args) => `${verb}/${opts(args)}`

let saga = acts => {
  let xs = []
  return acts.reduce(
    (p, act) => p.then(x => post(act, x).then(y => (xs.push([act, y]), y))),
    Promise.resolve(null)
  ).then(_ => xs)
}

let state = {
  saga: [],
}

let realize = x => {
  state.saga = x.map(([act, s]) => [act, transform(s), s])
  return render(state)
}

saga([
  "init",
  "frob/--how/1.000000001",
  "form/--ilk/ETH1/--gem/ETH",
  "cork/--ilk/ETH1/--hat/100",
  "mark/--gem/ETH/--tag/20/--zzz/600",
  "mint/--lad/Alice/--gem/ETH/--wad/100",
  "open/--lad/Alice/--ilk/ETH1/--urn/x",
  "lock/--urn/x/--wad/50",
  "crop/--ilk/ETH1/--tax/1.1",
  "warp/--era/1",
  "draw/--urn/x/--dai/10",
]).then(
  x => {
    ReactDOM.render(realize(x), document.getElementById("app"))
    document.querySelector("li:last-child details").open = true
  }
)

fetch("/git").then(x => x.text()).then(x => document.querySelector("git").innerHTML = x)

let perform = act => post(act, state.saga[state.saga.length - 1][2]).then(x => {
  state.saga = [...state.saga, [act, transform(x), x]]
  ReactDOM.render(render(state), document.getElementById("app"))
  document.querySelector("li:last-child details").open = true
  document.body.scrollTop = document.body.scrollHeight
}).catch(() => alert("That didn't work. Sorry for the bad error message."))

document.querySelector("#console").onkeypress =
  e => e.keyCode != 13 ? null : (
    perform(e.target.value.replace(/ /g, "/")),
    e.target.value = "",
    false
  )

# SOAK

SOAK Chrom Browser Extension.

스크립트를 빠르게 가져와 놀아 봅시다.

![demo](https://raw.github.com/D2festTeams/SOAK/gh-pages/soak_demo.gif)

## feature

* `javascript`, `css` 를 가져와 현재 페이지에 추가
* `jQuery plugin` 을 추가 가능 (ex `chardin.js`)
* `devtools` 의 콘솔을 통해 `javascript`, `css` 추가 (개발 중)

## install

* 프로젝트 클론
* 크롬을 열고 주소창에 `chrome://flags` 입력
* `Enable Developer Tools experiments.` 메뉴를 찾아 `enable`
* 크롬 재시작
* 주소창에 `chrome://extensions` 입력
* `Developer mode` 체크
* `Load unpacked extensions...` 선택하고 클론된 프로젝트 선택
* 크롬 확장기능에 보이면 끝!!

## how to use

* 아무 사이트나 접속
* 확장기능 중 `soak` 을 선택하고 실행하려는 스크립트를 선택.(`jQuery`, `Underscore`? more to come!!!)
	* 아, `chrome devtools`를 열고 스크립트를 선택하면 어디에 스크립트가 추가되었는지 바로 확인할 수 있음
* 추가된 스크립트로 사이트를 마음껏 가지고 놀기 :sparkles:

## trouble shoot

`chrome canaray` 최신버전에서 확장기능을 선택해도 팝업창이 보이지 않음

* `chrome://flags` 에서 `GPU compositing on all pages` 를 `disable` 로 설정하여 일시적으로 해결 가능
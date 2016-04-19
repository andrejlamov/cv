HEAD := $(shell git rev-parse --abbrev-ref HEAD)

all: .git/refs/heads/gh-pages
	git stash
	git checkout gh-pages
	git reset --hard master
	emacs -batch -l ~/.emacs cv.org --eval '(org-latex-export-to-pdf)' --eval '(org-html-export-to-html)'
	git add -f cv.pdf cv.html
	git commit -m "Go against all principles and add a pdf"
	git push -f origin gh-pages
	git checkout $(HEAD)
	git stash pop

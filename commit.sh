cd "/home/aparte/documentos/Juegos de mesa/" #Cambia la ruta si quieres usarlo en tu repositorio

echo "Hola, iniciaste el automatizador de commit"
echo "Ingresa el commit: " #Pide el commit
read men #lee el commit

#inserte comandos de git para subir el R.E.P.O.
git pull origin main --rebase
git add .
git commit -m "$men"
git push origin main

echo
echo "Ya se ha actualizado tu repo :D" #confirmacion que lo dice si falla o no XD
echo "Byeeeeee"

zipfile="kagglecatsanddogs_3367a.zip"

if [ ! -f $zipfile ]; then
	echo "Download the cat and dog dataset from Microsoft (https://www.microsoft.com/en-us/download/details.aspx?id=54765), place $zipfile into the bin folder, and run the script again."
	exit 1
else
	echo "Unpacking $zipfile"
	mkdir -p ../public/images/unpack
	unzip -q $zipfile -d ../public/images/unpack
	cd ../public/images
	mkdir -p captcha

	# move and rename folders
	echo "Moving folders"
	mv unpack/PetImages/Cat cats
	mv unpack/PetImages/Dog dogs
	rm -rf unpack

	# remove all but 300 random images
	echo "Reducing image set"
	cd cats
	ls -t | shuf | tail -n +301 | xargs rm -r
	cd ../dogs
	ls -t | shuf | tail -n +301 | xargs rm -r
	cd ..

	# files to store filenames of images
	echo "" > ../../data/cats.txt
	echo "" > ../../data/dogs.txt

	# copy hashed names
	echo "Generating captcha set"
	j=1
	for i in cats/*.jpg; do
		new=$(printf "cat%03d" "$j" | md5sum | awk '{print $1}')
		cp -i -- "$i" "captcha/$new.jpg"
		echo "$new.jpg" >> ../../data/cats.txt
		let j=j+1
	done
	j=1
	for i in dogs/*.jpg; do
		new=$(printf "dog%03d" "$j" | md5sum | awk '{print $1}')
		cp -i -- "$i" "captcha/$new.jpg"
		echo "$new.jpg" >> ../../data/dogs.txt
		let j=j+1
	done
fi

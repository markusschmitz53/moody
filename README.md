# moody

`tns debug android`

`tns build android --copy-to C:\projekte\Jane`

For the release build, all -key-store-* properties need to be defined:
__
`tns build android --release --copy-to C:\projekte\Jane --key-store-path XXX --key-store-password XXX --key-store-alias XXX --key-store-alias-password XXX`

tns platform remove android
tns platform add android@6.5.1
